import { SaveDataType } from "../room/index.js";
import type { User } from "../user/index.js";
import type { Method, Result } from "./index.js";

export interface SaveOptions extends Object {
  type?: SaveDataType;
  payload?: object;
}

export const Save: Method = (data: SaveOptions, user: User): Result => {
  if (!user.room) {
    return {
      message: "User not in room",
    };
  }

  if (data.type !== SaveDataType.ITEM && data.type !== SaveDataType.LOCATION) {
    return {
      message: "Type invalid",
    };
  }

  if (!data.payload) {
    return {
      message: "No Payload",
    };
  }

  user.room.SaveData(user, data);

  return {
    message: "Data saved",
  };
};
