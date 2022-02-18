import { User } from "../user";
import type { Method, Result } from ".";

interface MessageData extends Object {
  message?: string;
}
export const Message: Method = (
  messageData: MessageData,
  user: User
): Result => {
  if (!messageData.message) {
    return { message: "No message" };
  }

  if (!user.room) {
    return { message: "User not in room" };
  }

  //send a message
  user.room?.SendMessage({ message: messageData.message }, user);
  return { message: "Message Sent" };
};
