import type { User } from '../user/index.js';
import { Events, Result } from './events.js';
import type { Method } from './index.js';

export interface SettingsUpdatePayload {
  inProgress: boolean
}

export const SettingsUpdate: Method = (
  settingsUpdatePayload: SettingsUpdatePayload,
  user: User
): Result => {
  const room = user.Room;
  if (room) {
    room.SettingsUpdateInProgress(settingsUpdatePayload.inProgress ?? false);
    room.SendRoomUpdate(user);
  } else {
    return {
      event: Events.Response,
      error: new Error('Room not found')
    };
  }

  return {
    event: Events.Response
  };
};
