import { User } from '../user/index.js';
import type { Method, Result } from './index.js';

export const LeaveRoom: Method = (_, user: User): Result => {
  if (!user.roomId) {
    return { message: 'User not in room' };
  }

  // Disconnect from room
  user.leaveRoom();
  return { message: `Left room: ${user.roomId}` };
};
