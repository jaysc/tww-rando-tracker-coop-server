import { User } from '../user';
import type { Method } from '.';
import { Events, MessageEvent } from './events.js';

interface MessageData extends Object {
  message?: string
}
export const Message: Method = (
  messageData: MessageData,
  user: User
): MessageEvent => {
  if (!messageData.message) {
    return {
      event: Events.Message,
      error: new Error('No message')
    };
  }

  if (!user.roomId) {
    return {
      event: Events.Message,
      error: new Error('User not in room')
    };
  }

  // send a message
  const room = global.rooms.FindRoomById(user.roomId);
  if (room) {
    room.SendMessage({
      event: Events.Message,
      message: messageData.message
    }, user);
    return {
      event: Events.Message,
      error: new Error('Message Sent')
    };
  } else {
    user.leaveRoom();
    return {
      event: Events.Message,
      error: new Error('Room not found')
    };
  }
};
