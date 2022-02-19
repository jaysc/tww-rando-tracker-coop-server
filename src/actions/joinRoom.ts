import { Mode, RoomOptions } from "../room/index.js";
import type { User } from "../user/index.js";
import { Events, Method, Result } from "./index.js";

export const JoinRoom: Method = (
  roomOptions: RoomOptions,
  user: User
): Result => {
  const { name, password, perma } = roomOptions;

  if (!name) {
    return { err: Error("No room name specified") };
  }

  const room = global.rooms.JoinRoom(user, roomOptions);

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: "Joined room",
      data: {
        id: room.id,
        items: room.GetItemStore(),
        locations: room.GetLocationStore(),
      },
    };
  } else {
    return { message: "Failed to join room" };
  }
};
