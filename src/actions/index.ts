import type { WebSocketServer } from 'ws';
import type { User } from '../user/index.js';
import { Result } from './events.js';

export enum Actions {
  Get = 'get',
  JoinRoom = 'joinRoom',
  LeaveRoom = 'leaveRoom',
  Message = 'message',
  Set = 'set',
  SetName = 'setName'
}

export type Method = (data: any, user: User, ws: WebSocketServer) => Result;

export { Get } from './get.js';
export { JoinRoom } from './joinRoom.js';
export { LeaveRoom } from './leaveRoom.js';
export { Message } from './message.js';
export { Route } from './route.js';
export { Set } from './set.js';
export { SetName } from './setName.js';
