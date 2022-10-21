import { v4 } from 'uuid';
import { Room, RoomOptions, uuid } from '../room';

export class User {
  public id: string;
  public roomId?: uuid;

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

  get Room () {
    return this.roomId ? global.rooms.FindRoomById(this.roomId) : null;
  }

  public JoinRoom (roomOptions: RoomOptions): Room | null {
    return global.rooms.JoinRoom(this, roomOptions);
  }

  public leaveRoom () {
    if (this.roomId) {
      global.rooms.LeaveRoom(this.roomId, this);
      this.roomId = undefined;
    }
  }
}
