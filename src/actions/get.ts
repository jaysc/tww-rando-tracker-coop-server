import { ItemPayload, LocationPayload, SaveDataType } from "../room/index.js";
import type { Method, Result } from ".";
import type { User } from "../user/index.js";

export const Get: Method = (
  getOptions: ItemPayload | LocationPayload,
  user: User
) => {
  if (!user.room) {
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
  let getResult = user.room.GetData(getOptions);

  if (getResult) {
    return {
      data: getResult,
    };
  }

  return {
    message: "Not Found",
  };
};
