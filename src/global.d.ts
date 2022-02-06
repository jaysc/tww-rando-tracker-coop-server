import { connection } from ".";
import { Rooms } from "./room";

declare global {
  var rooms: Rooms;
  var connections: Map<string, connection>;
  var debugClient: connection | null;
}
