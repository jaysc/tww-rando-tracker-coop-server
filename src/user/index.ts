import { v4 } from "uuid";
import { Room } from "../room";
import * as _ from "lodash-es";

export class User {
  public id: string;
  public room: Room | null = null;
  constructor(userID?: string) {
    this.id = userID || v4();
  }

  public JoinRoom(room: Room) {
    this.room = room;
    room.AddUser(this);
  }

  public leaveRoom() {
    this.room?.RemoveUser(this);
    this.room = null;
  }
}
