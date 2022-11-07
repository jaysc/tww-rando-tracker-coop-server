import type { RawData, WebSocketServer } from 'ws';
import type { Method } from '../actions/index.js';
import type { User } from '../user/index.js';
import { Route } from '../actions/index.js';
import * as _ from 'lodash-es';
import { Result } from '../actions/events.js';

class Action {
  public data: object;
  public method: Method;
  public methodName: string;
  public user: User;

  constructor (data: object, methodName: string, method: Method, user: User) {
    this.data = data;
    this.methodName = methodName;
    this.method = method;
    this.user = user;
  }

  public execute (ws: WebSocketServer): Result {
    console.log(`Executing method ${this.methodName}`);
    return this.method(this.data, this.user, ws);
  }
}

export const ParseData = (
  rawData: RawData,
  user: User
): { action: Action, messageId?: string } | null => {
  try {
    const parsedData = JSON.parse(rawData.toString());
    const methodName = _.get(parsedData, 'method');
    const payload = _.get(parsedData, 'payload') ?? {};
    console.log(parsedData);

    const parsedMethod = Route(methodName);
    if (parsedMethod) {
      return {
        action: new Action(payload, methodName, parsedMethod, user),
        messageId: _.get(parsedData, 'messageId')
      };
    }
  } catch (ex) {
    console.warn('Error parsing data:', rawData.toString());
    console.warn('Exception:', ex);
    return null;
  }

  return null;
};

export { OnMessage } from './onMessage.js';
export { WsHandler } from './wsHandler.js';
