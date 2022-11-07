import { ItemPayload, LocationPayload, SaveDataType } from '../room/index.js';
import type { User } from '../user/index.js';
import { Events, SetEvent } from './events.js';
import type { Method } from './index.js';

export const Set: Method = (
  saveOptions: ItemPayload | LocationPayload,
  user: User
): SetEvent => {
  if (!user.roomId) {
    return {
      event: Events.Set,
      error: new Error('User not in room')
    };
  }

  if (
    !Object.values(SaveDataType).includes(saveOptions.type)
  ) {
    return {
      event: Events.Set,
      error: new Error('Type invalid')
    };
  }

  let data: ItemPayload | LocationPayload;
  if (saveOptions.type === SaveDataType.ITEM) {
    data = saveOptions;

    if (!data.itemName) {
      return {
        event: Events.Set,
        error: new Error('Missing itemName')
      };
    }
  } else if (saveOptions.type === SaveDataType.LOCATION) {
    data = saveOptions;

    if (!data.generalLocation) {
      return {
        event: Events.Set,
        error: new Error('Missing generalLocation')
      };
    }

    if (!data.detailedLocation) {
      return {
        event: Events.Set,
        error: new Error('Missing detailedLocation')
      };
    }
  }

  const room = user.Room;
  if (room) {
    room.SaveData(user, saveOptions);
  } else {
    return {
      event: Events.Set,
      error: new Error('Room not found')
    };
  }

  return {
    event: Events.Set,
    message: 'Data saved'
  };
};
