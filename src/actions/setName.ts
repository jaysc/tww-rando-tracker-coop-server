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
  user.SetName(setNamePayload.name);
  if (user.Room) {
    user.Room.SendRoomUpdate();
  }

  return {
    event: Events.SetName,
    data: {
      name: user.name
    }
  };
};
