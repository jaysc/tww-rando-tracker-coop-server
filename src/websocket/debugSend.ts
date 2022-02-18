import type { uuid } from "../room";
import * as _ from "lodash-es";

export const DebugSend = () => {
  if (global.debugClient) {
    const rooms = global.rooms.GetRooms();
    let debugResult = {};
    for (const roomId in rooms) {
      const room = rooms[roomId as uuid];
      _.set(debugResult, ["rooms", roomId, "name"], room.name);
      _.set(debugResult, ["rooms", roomId, "perma"], room.perma);

      _.set(debugResult, ["rooms", roomId, "users"], room.userIds);
      _.set(debugResult, ["rooms", roomId, "items"], room.GetItemStore());
      _.set(
        debugResult,
        ["rooms", roomId, "locations"],
        room.GetLocationStore()
      );
    }

    const allUsers = [];
    for (const user of global.connections.keys()) {
      allUsers.push(user);
    }
    _.set(debugResult, "allUsers", allUsers);
    global.debugClient.socket.send(JSON.stringify(debugResult, null, 2));
  }
};
