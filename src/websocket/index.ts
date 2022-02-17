import type { RawData, WebSocketServer } from "ws";
import type { Method, Result } from "../actions/index.js";
import {
  Actions,
  JoinRoom,
  LeaveRoom,
  Message,
  Save,
} from "../actions/index.js";
import type { User } from "../user/index.js";

import * as _ from "lodash-es";
import { Get } from "../actions/get.js";

class Action {
  public data: object;
  public method: Method;
  public methodName: string;
  public user: User;

  constructor(data: object, methodName: string, method: Method, user: User) {
    this.data = data;
    this.methodName = methodName;
    this.method = method;
    this.user = user;
  }

  public execute(ws: WebSocketServer): Result {
    console.log(`Executing method ${this.methodName}`);
    return this.method(this.data, this.user, ws);
  }
}

export const ParseData = (payload: RawData, user: User): Action | null => {
  try {
    let parsedData = JSON.parse(payload.toString());
    const methodName = _.get(parsedData, "method");
    console.log(parsedData);

    let parsedMethod = Route(methodName);
    if (parsedMethod) {
      return new Action(
        _.get(parsedData, "data"),
        methodName,
        parsedMethod,
        user
      );
    }
  } catch (ex) {
    console.warn(`Error parsing data:`, payload.toString());
    console.warn("Exception:", ex);
    return null;
  }

  return null;
};

export const Route = (method?: string): Method | null => {
  if (method == null) {
    return null;
  }
  var parsedMethod: Actions = Actions[method as keyof typeof Actions];

  switch (parsedMethod) {
    case Actions.JoinRoom:
      return JoinRoom;
    case Actions.LeaveRoom:
      return LeaveRoom;
    case Actions.Message:
      return Message;
    case Actions.Save:
      return Save;
    case Actions.Get:
      return Get;
    default:
      console.log(`Method not found: ${parsedMethod}`);
      break;
  }

  return null;
};

export { OnMessage } from "./onMessage.js";
export { WsHandler } from "./wsHandler.js";
