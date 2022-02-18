import * as _ from "lodash-es";
import { v4 as uuidv4 } from "uuid";
import { User } from "../user";
import { Events, Result } from "../actions/index.js";
import { createStore, Store, Schema } from "tinybase";

export type uuid = string & { readonly _: unique symbol };

export interface RoomOptions {
  name: string;
  password?: string;
  perma?: string;
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
};

export type LocationPayload = {
  type: SaveDataType;
  generalLocation: string;
  detailedLocation: string;
  isChecked?: boolean;
  itemName?: string;
};

export class Room {
  #password?: string;
  #itemStore: Store = createStore();
  #locationStore: Store = createStore();

  public perma?: string;
  public id: uuid;
  public userIds: Array<string> = [];
  public name: string;

  constructor({ name, password, perma }: RoomOptions) {
    this.id = uuidv4() as uuid;
    this.#password = password;

    this.name = name;
    this.perma = perma;

    this.#itemStore.setTables({
      items: {},
      locations: {},
    });
  }
  public GetItemStore = () => this.#itemStore.getTables();
  public GetLocationStore = () => this.#locationStore.getTables();

  public HasPassword = () => !_.isEmpty(this.#password);

  public PasswordAccept(password?: string) {
    if (this.HasPassword()) {
      return password === this.#password;
    }
    return false;
  }

  public AddUser(user: User) {
    this.userIds = _.union(this.userIds, [user.id]);
  }

  public RemoveUser(user: User): boolean {
    let userRemoved = false;
    _.remove(this.userIds, (x) => {
      const temp = x == user.id;
      if (!userRemoved) {
        userRemoved = temp;
      }
      return temp;
    });

    return userRemoved;
  }

  public SendMessage(response: Result, user?: User) {
    _.forEach(this.userIds, (userId) => {
      if (user && user.id === userId) {
        return;
      }

      global.connections.get(userId)?.socket.send(JSON.stringify(response));
    });
  }

  public SaveData(user: User, saveOptions: ItemPayload | LocationPayload) {
    if (saveOptions.type === SaveDataType.ITEM) {
      this.SaveItem(user, saveOptions as ItemPayload);
    }
    if (saveOptions.type === SaveDataType.LOCATION) {
      this.SaveLocation(user, saveOptions as LocationPayload);
    }

    const message: Result = {
      data: { ...saveOptions, userId: user.id, Event: Events.DataSaved },
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

  private SaveItem(
    user: User,
    { itemName, count, generalLocation, detailedLocation }: ItemPayload
  ) {
    const dataToSave = _.omitBy({
      count: count ?? 0,
      generalLocation: generalLocation,
      detailedLocation: detailedLocation,
    }, _.isNil);

    this.#itemStore.setPartialRow(itemName, user.id, dataToSave as {});
  }

  private SaveLocation(
    user: User,
    { generalLocation, detailedLocation, isChecked, itemName }: LocationPayload
  ) {
    const dataToSave = _.omitBy({
      isChecked: isChecked,
      itemName: itemName,
    }, _.isNil);
    this.#locationStore.setPartialRow(
      `${generalLocation}#${detailedLocation}`,
      user.id,
      dataToSave as {}
    );
  }
}

export class Rooms {
  #rooms: { [RoomId: uuid]: Room } = {};

  public GetRooms() {
    return this.#rooms;
  }

  public JoinRoom(user: User, roomOptions: RoomOptions): Room | null {
    let room = this.FindRoomByName(roomOptions.name);
    let roomId;

    if (room == null) {
      //Create room
      room = new Room(roomOptions);
      this.#rooms[room.id] = room;

      user.JoinRoom(room);
    } else if (room.HasPassword()) {
      if (room.PasswordAccept(roomOptions.password)) {
        user.JoinRoom(room);
      } else {
        //incorrect password
        console.warn("Incorrect password");
        return null;
      }
    } else {
      user.JoinRoom(room);
    }

    return room;
  }

  public LeaveRoom(room: Room, user: User) {
    return this.FindRoomById(room.id)?.RemoveUser(user);
  }

  private FindRoomByName(name: string): Room | undefined {
    return _.find(this.#rooms, (room) => {
      return room.name === name;
    });
  }

  private FindRoomById(id: uuid): Room | null {
    return this.#rooms[id];
  }
}
