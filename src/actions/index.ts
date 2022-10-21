import type { WebSocketServer } from 'ws';
import type { User } from '../user/index.js';

export enum Actions {
  JoinRoom = 'joinRoom',
  LeaveRoom = 'leaveRoom',
  Message = 'message',
  Set = 'set',
  Get = 'get',
}

export enum Events {
  JoinedRoom = 'joinedRoom',
  OnConnect = 'onConnect',
  DataSaved = 'dataSaved',
  Response = 'response',
  ItemMessage = 'itemMessage',
}

export interface Result {
  event?: Events
  messageId?: string
  message?: string
  err?: Error
  data?: object
}

export type Method = (data: any, user: User, ws: WebSocketServer) => Result;

export { JoinRoom } from './joinRoom.js';
export { LeaveRoom } from './leaveRoom.js';
export { Message } from './message.js';
export { Set } from './set.js';
export { Get } from './get.js';
export { Route } from './route.js';
