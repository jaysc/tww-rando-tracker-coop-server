import type { uuid } from "../room";
import * as _ from "lodash-es";

export const DebugSend = () => {
  if (global.debugClient) {
    const rooms = global.rooms.GetRooms();
    let debugResult = {};
    for (const roomId in rooms) {
      const room = rooms[roomId as uuid];
      _.set(debugResult, [roomId, "items"], room.GetItemStore());
      _.set(debugResult, [roomId, "locations"], room.GetLocationStore());
    }
    global.debugClient.socket.send(JSON.stringify(debugResult, null, 2));
  }
};
