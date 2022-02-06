import type { User } from "../user/index.js";
import type { Method, Result } from "./index.js";

type RoomInfo = Object & {
  name?: string; //treat as gameId
  password?: string;
  perma?: string;
};

export const JoinRoom: Method = (data: RoomInfo, user: User): Result => {
  const { name, password, perma } = data;

  if (!name) {
    return { err: Error("No room name specified") };
  }

  return global.rooms.JoinRoom(user, { name, password, perma });
};
