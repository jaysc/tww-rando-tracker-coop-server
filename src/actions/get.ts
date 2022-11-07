import { SaveDataPayload, SaveDataType } from '../room/index.js';
import type { Method } from '.';
import type { User } from '../user/index.js';
import { Events, GetDataEvent } from './events.js';

export const Get: Method = (
  getOptions: SaveDataPayload,
  user: User
): GetDataEvent => {
  if (!user.roomId) {
    return {
      event: Events.GetData,
      message: 'User not in room'
    };
  }

  if (
    getOptions.type !== SaveDataType.ITEM &&
    getOptions.type !== SaveDataType.LOCATION
  ) {
    return {
      event: Events.GetData,
      message: 'Type invalid'
    };
  }
  const getResult = user.Room?.GetData(getOptions);

  if (getResult) {
    return {
      event: Events.GetData,
      data: getResult
    };
  }

  return {
    event: Events.GetData,
    message: 'Not Found'
  };
};
