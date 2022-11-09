import type { User } from '../user/index.js';
import { Events, SetNameEvent } from './events.js';
import type { Method } from './index.js';

export interface SetNamePayload {
  name: string
}

export const SetName: Method = (
  setNamePayload: SetNamePayload,
  user: User
): SetNameEvent => {
  if (!setNamePayload.name) {
    return {
      event: Events.SetName,
      name: setNamePayload.name,
      error: new Error('User name not specified')
    };
  }

  user.SetName(setNamePayload.name);

  return {
    event: Events.SetName,
    name: user.name,
    error: new Error('Room not found')
  };
};
