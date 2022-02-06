import { v4 as uuidv4 } from "uuid";
import { Room } from "../room";

export class User {
  public id: string;
  public room: Room | null = null;
  constructor(userID?: string) {
    this.id = userID ?? uuidv4();
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
