/* eslint-disable no-var */
import { connection } from '.';
import { Rooms } from './room';

declare global {
  var rooms: Rooms;
  var connections: Map<string, connection>;
  var debugClient: connection | null;
  var heartBeat: NodeJS.Timer | null;
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      ADMIN_ID: string
      ROOM_LIFETIME_MINUTES: string
      CHECK_INTERVAL: string
      PING_INTERVAL: string
    }
  }
}
