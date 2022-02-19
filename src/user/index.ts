import { v4 } from "uuid";
import { Room, uuid } from "../room";
import * as _ from "lodash-es";

export class User {
  public id: string;
  public roomId?: uuid;

  constructor(userID?: string) {
    this.id = userID || v4();
  }

  public JoinRoom(room: Room) {
    this.roomId = room.id;
    room.AddUser(this);
  }

  public leaveRoom() {
    if (this.roomId) {
      global.rooms.LeaveRoom(this.roomId, this);
      this.roomId = undefined;
    }
  }
}
