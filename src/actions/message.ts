import { User } from "../user";
import type { Method, Result } from ".";

interface MessageData extends Object {
  message?: string;
}
export const Message: Method = (data: MessageData, user: User): Result => {
  if (!data.message) {
    return { message: "No message" };
  }

  if (!user.room) {
    return { message: "User not in room" };
  }

  //send a message
  user.room?.SendMessage(data.message, user);
  return { message: "Message Sent" };
};
