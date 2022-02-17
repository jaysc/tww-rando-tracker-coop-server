import { SaveDataType } from "../room/index.js";
import type { Method, Result } from ".";
import type { User } from "../user/index.js";

export interface GetOptions extends Object {
  type?: SaveDataType;
  payload?: object;
}

export const Get: Method = (data: GetOptions, user: User) => {
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
  let getResult = user.room.GetData(data);

  if (getResult) {
    return {
      data: getResult,
    };
  }

  return {
    message: "Not Found",
  };
};
