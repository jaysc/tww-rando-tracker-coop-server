import type { User } from "../user/index.js";
import { Events, Method, Result } from "./index.js";

type RoomOptions = Object & {
  name?: string; //treat as gameId
  password?: string;
  perma?: string;
};

export const JoinRoom: Method = (roomOptions: RoomOptions, user: User): Result => {
  const { name, password, perma } = roomOptions;

  if (!name) {
    return { err: Error("No room name specified") };
  }

  const room = global.rooms.JoinRoom(user, { name, password, perma });

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: "Joined room",
      data: {
        items: room.GetItemStore(),
        locations: room.GetLocationStore(),
      },
    };
  } else {
    return { message: "Failed to join room" };
  }
};
