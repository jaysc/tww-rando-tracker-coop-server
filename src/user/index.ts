import { v4 } from "uuid";
import { Room, RoomOptions, uuid } from "../room";
import * as _ from "lodash-es";

export class User {
  public id: string;
  public roomId?: uuid;

  constructor(userID?: string) {
    this.id = userID || v4();
  }

  get Room() {
    return this.roomId ? global.rooms.FindRoomById(this.roomId) : null;
  }

  public JoinRoom(roomOptions: RoomOptions): Room | null {
    return global.rooms.JoinRoom(this, roomOptions);
  }

  public leaveRoom() {
    if (this.roomId) {
      global.rooms.LeaveRoom(this.roomId, this);
      this.roomId = undefined;
    }
  }
}
