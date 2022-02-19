import type { uuid } from "../room";
import * as _ from "lodash-es";

export const DebugSend = () => {
  if (global.debugClient) {
    const rooms = global.rooms.GetRooms();
    let debugResult = {};
    for (const roomId in rooms) {
      const room = rooms[roomId as uuid];
      _.set(debugResult, ["rooms", roomId], room.GetStatus());
    }

    const allUsers = [];
    for (const user of global.connections.keys()) {
      allUsers.push(user);
    }
    _.set(debugResult, "allUsers", allUsers);
    global.debugClient.socket.send(JSON.stringify(debugResult, null, 2));
  }
};
