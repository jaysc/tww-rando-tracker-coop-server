import { User } from '../user/index.js';
import { Events, LeaveRoomEvent } from './events.js';
import type { Method } from './index.js';

export const LeaveRoom: Method = (_, user: User): LeaveRoomEvent => {
  if (!user.roomId) {
    return {
      event: Events.LeaveRoom,
      message: 'User not in room'
    };
  }

  // Disconnect from room
  user.LeaveRoom();
  return {
    event: Events.LeaveRoom,
    message: `Left room: ${user.roomId}`
  };
};
