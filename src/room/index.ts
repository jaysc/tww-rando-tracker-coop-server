import * as _ from "lodash-es";
import { v4 as uuidv4 } from "uuid";
import { User } from "../user";
import type { Result } from "../actions";
import { createStore, Store, Schema } from "tinybase";
import { SaveOptions } from "../actions/save";

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
  itemName: string;
  count: number;
  location?: Location;
};

export type Location = {
  generalLocation: string;
  detailedLocation: string;
};

export type LocationPayload = {
  generalLocation: string;
  detailedLocation: string;
  isChecked: boolean;
  itemName?: string;
};

export type LocationCell = {
  userId: string;
  itemName: string;
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

  public SendMessage(message: string, user?: User) {
    _.forEach(this.userIds, (userId) => {
      if (user && user.id === userId) {
        return;
      }

      global.connections.forEach((ws) => {
        if (ws.user?.id == userId) {
          console.log(`userId: ${ws.user?.id}`);
          console.log(`userId compare: ${userId}`);
          ws.socket.send(message);
        }
      });
    });
  }

  public SaveData(user: User, { type, payload }: SaveOptions) {
    if (type === SaveDataType.ITEM) {
      this.SaveItem(user, payload as ItemPayload);
    }
    if (type === SaveDataType.LOCATION) {
      this.SaveLocation(user, payload as LocationPayload);
    }
  }

  private SaveItem(user: User, { itemName, count }: ItemPayload) {
    this.#itemStore.setRow(itemName, user.id, { count });
  }

  private SaveLocation(
    user: User,
    { generalLocation, detailedLocation, isChecked, itemName }: LocationPayload
  ) {
    this.#locationStore.setRow(
      `${generalLocation}-${detailedLocation}`,
      user.id,
      {
        isChecked,
        itemName: itemName ?? "",
      }
    );
  }
}

export class Rooms {
  #rooms: { [RoomId: uuid]: Room } = {};

  public GetRooms() {
    return this.#rooms;
  }

  public JoinRoom(user: User, roomOptions: RoomOptions): Result {
    let room = this.FindRoomByName(roomOptions.name);

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
        return new Error("Password incorrect");
      }
    } else {
      user.JoinRoom(room);
    }

    return { message: `User joined room: ${room.name}` };
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
