import _ from "lodash";
import { ItemPayload, LocationPayload, SaveDataType } from "../room/index.js";
import type { User } from "../user/index.js";
import type { Method, Result } from "./index.js";

export const Set: Method = (
  saveOptions: ItemPayload | LocationPayload,
  user: User
): Result => {
  if (!user.room) {
    return {
      message: "User not in room",
    };
  }

  if (
    saveOptions.type !== SaveDataType.ITEM &&
    saveOptions.type !== SaveDataType.LOCATION
  ) {
    return {
      message: "Type invalid",
    };
  }

  let data: ItemPayload | LocationPayload;
  if (saveOptions.type === SaveDataType.ITEM) {
    data = saveOptions as ItemPayload;

    if (!!!data.itemName) {
      return {
        message: "Missing itemName",
      };
    }
  } else if (saveOptions.type === SaveDataType.LOCATION) {
    data = saveOptions as LocationPayload;

    if (!!!data.generalLocation) {
      return {
        message: "Missing generalLocation",
      };
    }

    if (!!!data.detailedLocation) {
      return {
        message: "Missing detailedLocation",
      };
    }
  }

  user.room.SaveData(user, saveOptions);

  return {
    message: "Data saved",
  };
};
