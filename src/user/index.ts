import { v4 } from 'uuid';
import { Room, RoomOptions, uuid } from '../room';
import NAMES from './names.js';

export class User {
  public id: string;
  public roomId?: uuid;
  public name: string = User.GetRandomName();

  constructor (userID?: string) {
    if (userID) {
      const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!pattern.test(userID)) {
        userID = '';
      }
    }
    this.id = userID ?? v4();
  }

  public static GetRandomName () {
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  }

  get Room () {
    return this.roomId ? global.rooms.FindRoomById(this.roomId) : null;
  }

  public JoinRoom (roomOptions: RoomOptions): Room | null {
    return global.rooms.JoinRoom(this, roomOptions);
  }

  public LeaveRoom () {
    if (this.roomId) {
      global.rooms.LeaveRoom(this.roomId, this);
      this.roomId = undefined;
    }
  }

  public SetName (newName: string) {
    this.name = newName.slice(0, 20);
  }
}
