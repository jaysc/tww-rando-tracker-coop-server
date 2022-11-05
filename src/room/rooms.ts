import * as _ from 'lodash-es';

import { Room, RoomOptions, uuid } from './index.js';
import { User } from '../user';
import { DebugSend } from '../websocket/debugSend.js';

export class Rooms {
  #rooms: { [RoomId: uuid]: Room } = {};
  #cleanupInterval?: NodeJS.Timer;

  private SetupCleanup () {
    if (!this.#cleanupInterval) {
      console.log('Starting cleanup interval');
      this.#cleanupInterval = setInterval(
        this.DeleteInvalidRooms.bind(this),
        parseInt(process.env.CHECK_INTERVAL) ?? 30
      );
    }
  }

  private RemoveSetupCleanup () {
    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = undefined;
    }
  }

  private DeleteInvalidRooms () {
    console.log('Checking room');

    const roomsToDelete = [];
    for (const roomId in this.#rooms) {
      const room = this.#rooms[roomId as uuid];
      if (room.FlagDelete()) {
        roomsToDelete.push(roomId);
      }
    }

    for (const roomId of roomsToDelete) {
      console.log('Removing room: ', roomId);
      this.DeleteRoom(roomId as uuid);
    }

    if (_.size(this.#rooms) === 0) {
      console.log('Stopping cleanup interval');
      this.RemoveSetupCleanup();
    }

    DebugSend();
  }

  public DeleteRoom (roomId: uuid) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.#rooms[roomId];
  }

  get Rooms () {
    return this.#rooms;
  }

  private CreateRoom (roomOptions: RoomOptions, user?: User) {
    const room = new Room(roomOptions, user);
    this.#rooms[room.id] = room;

    this.SetupCleanup();

    return room;
  }

  public JoinRoom (user: User, roomOptions: RoomOptions): Room | null {
    let room = this.FindRoom(roomOptions);

    if (room == null) {
      room = this.CreateRoom(roomOptions, user);
      room.AddUser(user);
    } else if (room.HasPassword()) {
      if (room.PasswordAccept(roomOptions.password)) {
        room.AddUser(user);
      } else {
        // incorrect password
        console.warn('Incorrect password');
        return null;
      }
    } else {
      room.AddUser(user);
    }

    return room;
  }

  public LeaveRoom (roomId: uuid, user: User) {
    return this.FindRoomById(roomId)?.RemoveUser(user);
  }

  public UserDisconnect (user: User) {
    for (const roomId in this.#rooms) {
      const room = this.#rooms[roomId as uuid];
      room.RemoveUser(user);
    }
  }

  public FindRoom ({
    mode,
    name,
    perma
  }: RoomOptions) {
    return _.find(this.#rooms, (room) => {
      return room.name === name &&
        room.mode === mode &&
        room.perma === perma
    });
  }

  public FindRoomByName (name: string): Room | undefined {
    return _.find(this.#rooms, (room) => {
      return room.name === name;
    });
  }

  public FindRoomById (id: uuid): Room | null {
    return this.#rooms[id];
  }
}
