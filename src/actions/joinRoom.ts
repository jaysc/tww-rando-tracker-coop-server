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

  const room = user.JoinRoom(roomOptions);

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: "Joined room",
      data: {
        id: room.id,
        items: room.ItemStore,
        locations: room.LocationStore,
      },
    };
  } else {
    return { message: "Failed to join room" };
  }
};
