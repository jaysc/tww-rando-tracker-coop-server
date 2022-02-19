import { ItemPayload, LocationPayload, SaveDataType } from "../room/index.js";
import type { Method, Result } from ".";
import type { User } from "../user/index.js";

export const Get: Method = (
  getOptions: ItemPayload | LocationPayload,
  user: User
) => {
  if (!user.roomId) {
    return {
      message: "User not in room",
    };
  }

  if (
    getOptions.type !== SaveDataType.ITEM &&
    getOptions.type !== SaveDataType.LOCATION
  ) {
    return {
      message: "Type invalid",
    };
  }
  let getResult = global.rooms.FindRoomById(user.roomId);

  if (getResult) {
    return {
      data: getResult,
    };
  }

  return {
    message: "Not Found",
  };
};
