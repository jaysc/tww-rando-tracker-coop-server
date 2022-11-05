import type { WebSocketServer } from 'ws';
import type { User } from '../user/index.js';

export enum Actions {
  Get = 'get',
  JoinRoom = 'joinRoom',
  LeaveRoom = 'leaveRoom',
  Message = 'message',
  Set = 'set',
}

export enum Events {
  DataSaved = 'dataSaved',
  ItemMessage = 'itemMessage',
  JoinedRoom = 'joinedRoom',
  OnConnect = 'onConnect',
  Response = 'response',
}

export interface Result {
  event?: Events
  messageId?: string
  message?: string
  err?: Error
  errorMessage?: string
  data?: object
}

export type Method = (data: any, user: User, ws: WebSocketServer) => Result;

export { Get } from './get.js';
export { JoinRoom } from './joinRoom.js';
export { LeaveRoom } from './leaveRoom.js';
export { Message } from './message.js';
export { Route } from './route.js';
export { Set } from './set.js';
