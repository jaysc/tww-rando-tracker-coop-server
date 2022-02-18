import {
  Actions,
  JoinRoom,
  LeaveRoom,
  Message,
  Save,
  Get,
  Method,
} from "./index.js";

export const Route = (method?: string): Method | null => {
  if (method == null) {
    return null;
  }

  switch (method) {
    case Actions.JoinRoom:
      return JoinRoom;
    case Actions.LeaveRoom:
      return LeaveRoom;
    case Actions.Message:
      return Message;
    case Actions.Set:
      return Save;
    case Actions.Get:
      return Get;
    default:
      console.log(`Method not found: ${method}`);
      break;
  }

  return null;
};
