import {
  Actions,
  Get,
  JoinRoom,
  LeaveRoom,
  Message,
  type Method,
  Set,
  SetName,
  SettingsUpdate
} from './index.js';

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
      return Set;
    case Actions.Get:
      return Get;
    case Actions.SetName:
      return SetName;
    case Actions.SettingsUpdate:
      return SettingsUpdate;
    default:
      console.log(`Method not found: ${method}`);
      break;
  }

  return null;
};
