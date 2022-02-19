import * as _ from "lodash-es";
import { v4 as uuidv4 } from "uuid";
import { User } from "../user";
import { Events, Result } from "../actions/index.js";
import { createStore, Store, Schema } from "tinybase";
import { differenceInMinutes } from "date-fns";
import { DebugSend } from "../websocket/debugSend.js";

export type uuid = string & { readonly _: unique symbol };

export interface RoomOptions {
  name: string;
  password?: string;
  perma?: string;
  mode?: Mode;
}

export enum SaveDataType {
  ITEM = "ITEM",
  LOCATION = "LOCATION",
}

export type ItemPayload = {
  type: SaveDataType;
  itemName: string;
  count?: number;
  generalLocation?: string;
  detailedLocation?: string;
  sphere?: number;
};

export type LocationPayload = {
  type: SaveDataType;
  generalLocation: string;
  detailedLocation: string;
  isChecked?: boolean;
  itemName?: string;
  sphere?: number;
};

export enum Mode {
  ITEMSYNC = "ITEMSYNC",
  COOP = "COOP",
}

export class Room {
  #password?: string;
  #itemStore: Store = createStore();
  #locationStore: Store = createStore();
  #mode: Mode;
  #userIds: Array<string> = [];

  public perma?: string;
  public id: uuid;
  public name: string;
  public createdDate: Date = new Date();
  public lastAction: Date = new Date();

  constructor({ name, password, perma, mode }: RoomOptions) {
    this.id = uuidv4() as uuid;
    this.#password = password;
    this.#mode = mode ?? Mode.ITEMSYNC;

    this.name = name;
    this.perma = perma;

    this.#itemStore.setTables({
      items: {},
      locations: {},
    });
  }

  get ItemStore() {
    return this.#itemStore.getTables();
  }
  get LocationStore() {
    return this.#locationStore.getTables();
  }

  public HasPassword = () => !_.isEmpty(this.#password);

  public GetStatus() {
    return {
      name: this.name,
      perma: this.perma,
      mode: this.#mode,
      createdDate: this.createdDate,
      lastAction: this.lastAction,
      users: this.#userIds,
      items: this.ItemStore,
      locations: this.LocationStore,
    };
  }

  public PasswordAccept(password?: string) {
    if (this.HasPassword()) {
      return password === this.#password;
    }
    return false;
  }

  public AddUser(user: User) {
    this.#userIds = _.union(this.#userIds, [user.id]);
    user.roomId = this.id;
    this.lastAction = new Date();
  }

  public RemoveUser(user: User): boolean {
    let userRemoved = false;
    _.remove(this.#userIds, (x) => {
      const temp = x == user.id;
      if (!userRemoved) {
        userRemoved = temp;
      }
      return temp;
    });

    this.lastAction = new Date();

    return userRemoved;
  }

  public HasUser(user: User) {
    return this.#userIds.includes(user.id);
  }

  public SendMessage(response: Result, user?: User) {
    _.forEach(this.#userIds, (userId) => {
      if (user && user.id === userId) {
        return;
      }

      global.connections.get(userId)?.socket.send(JSON.stringify(response));
    });

    this.lastAction = new Date();
  }

  public SaveData(user: User, saveOptions: ItemPayload | LocationPayload) {
    if (saveOptions.type === SaveDataType.ITEM) {
      this.SaveItem(user, saveOptions as ItemPayload);
    }
    if (saveOptions.type === SaveDataType.LOCATION) {
      this.SaveLocation(user, saveOptions as LocationPayload);
    }

    const message: Result = {
      event: Events.DataSaved,
      data: { ...saveOptions, userId: user.id },
    };

    this.SendMessage(message, user);
  }

  public GetData(getOptions: ItemPayload | LocationPayload) {
    let result;

    if (getOptions.type === SaveDataType.ITEM) {
      result = this.GetItem(getOptions as ItemPayload);
    }
    if (getOptions.type === SaveDataType.LOCATION) {
      result = this.GetLocation(getOptions as LocationPayload);
    }

    this.lastAction = new Date();
    return result;
  }

  private GetItem({ itemName }: ItemPayload) {
    if (itemName) {
      return this.#itemStore.getTable(itemName);
    } else {
      return this.#itemStore.getTables();
    }
  }

  private GetLocation({ generalLocation, detailedLocation }: LocationPayload) {
    if (generalLocation || detailedLocation) {
      return this.#locationStore.getTable(
        `${generalLocation}-${detailedLocation}`
      );
    } else {
      return this.#locationStore.getTables();
    }
  }

  private SaveId(user: User) {
    return this.#mode === Mode.ITEMSYNC ? this.id : user.id;
  }

  private SaveItem(
    user: User,
    { itemName, count, generalLocation, detailedLocation, sphere }: ItemPayload
  ) {
    const dataToSave = _.omitBy(
      {
        count: count ?? 0,
        generalLocation: generalLocation,
        detailedLocation: detailedLocation,
        sphere,
      },
      _.isNil
    );

    this.#itemStore.setPartialRow(
      itemName,
      this.SaveId(user),
      dataToSave as {}
    );
  }

  private SaveLocation(
    user: User,
    {
      generalLocation,
      detailedLocation,
      isChecked,
      itemName,
      sphere,
    }: LocationPayload
  ) {
    const dataToSave = _.omitBy(
      {
        isChecked: isChecked,
        itemName: itemName,
        sphere: sphere,
      },
      _.isNil
    );
    this.#locationStore.setPartialRow(
      `${generalLocation}#${detailedLocation}`,
      this.SaveId(user),
      dataToSave as {}
    );
  }

  public FlagDelete() {
    // Delete room if empty
    // Delete room if last action is older than 30 minutes
    return (
      this.#userIds.length == 0 ||
      differenceInMinutes(new Date(), this.lastAction) >
        parseInt(process.env.ROOM_LIFETIME_MINUTES)
    );
  }
}

export class Rooms {
  #rooms: { [RoomId: uuid]: Room } = {};

  constructor() {
    setInterval(
      this.DeleteInvalidRooms.bind(this),
      parseInt(process.env.CHECK_INTERVAL)
    );
  }

  private DeleteInvalidRooms() {
    console.log("Checking room");
    const roomsToDelete = [];
    for (const roomId in this.#rooms) {
      const room = this.#rooms[roomId as uuid];
      if (room.FlagDelete()) {
        roomsToDelete.push(roomId);
      }
    }

    for (const roomId of roomsToDelete) {
      console.log("Removing room: ", roomId);
      this.DeleteRoom(roomId as uuid);
    }

    DebugSend();
  }

  public DeleteRoom(roomId: uuid) {
    delete this.#rooms[roomId as uuid];
  }

  get Rooms() {
    return this.#rooms;
  }

  private CreateRoom(roomOptions: RoomOptions) {
    const room = new Room(roomOptions);
    this.#rooms[room.id] = room;
    return room;
  }

  public JoinRoom(user: User, roomOptions: RoomOptions): Room | null {
    let room = this.FindRoomByName(roomOptions.name);

    if (room == null) {
      room = this.CreateRoom(roomOptions);
      room.AddUser(user);
    } else if (room.HasPassword()) {
      if (room.PasswordAccept(roomOptions.password)) {
        room.AddUser(user);
      } else {
        //incorrect password
        console.warn("Incorrect password");
        return null;
      }
    } else {
      room.AddUser(user);
    }

    return room;
  }

  public LeaveRoom(roomId: uuid, user: User) {
    return this.FindRoomById(roomId as uuid)?.RemoveUser(user);
  }

  public UserDisconnect(user: User) {
    for (let roomId in this.#rooms) {
      const room = this.#rooms[roomId as uuid];
      room.RemoveUser(user);
    }
  }

  private FindRoomByName(name: string): Room | undefined {
    return _.find(this.#rooms, (room) => {
      return room.name === name;
    });
  }

  public FindRoomById(id: uuid): Room | null {
    return this.#rooms[id];
  }
}
