import type { WebSocketServer } from "ws";
import type { User } from "../user/index.js";

export enum Actions {
  JoinRoom,
  LeaveRoom,
  Message,
  Save,
  Get,
}

export type Result = {
  message?: string;
  err?: Error;
  data?: object;
};

export interface Method {
  (data: object, user: User, ws: WebSocketServer): Result;
}

export { JoinRoom } from "./joinRoom.js";
export { LeaveRoom } from "./leaveRoom.js";
export { Message } from "./message.js";
export { Save } from "./save.js";
