import type { uuid } from '../room';
import * as _ from 'lodash-es';

export const DebugSend = () => {
  if (global.debugClient) {
    const debugResult = {};

    const allUsers = {}
    for (const con of global.connections.values()) {
      if (con.user) {
        _.set(allUsers, con.user.id, con.user.name)
      }
    }
    _.set(debugResult, 'allUsers', allUsers);

    const rooms = global.rooms.Rooms;
    for (const roomId in rooms) {
      const room = rooms[roomId as uuid];
      _.set(debugResult, ['rooms', roomId], room.GetStatus());
    }

    global.debugClient.socket.send(JSON.stringify(debugResult, null, 2));
  }
};
