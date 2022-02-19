import type { FastifyInstance, FastifyRequest } from "fastify";
import { OnMessage } from "./onMessage.js";
import type { connection } from "../index.js";
import { User } from "../user/index.js";
import { Events, Result } from "../actions/index.js";

export const WsHandler =
  (server: FastifyInstance) => (con: connection, request: FastifyRequest) => {
    //'Connection' event
    if (!con.user) {
      //todo Retrieve existing user here from cookie (or maybe session id)
      const userId = request.cookies.userId;
      con.user = new User(userId);
      //todo Send client id back to client and store via cookie/local storage

      global.connections.set(con.user.id, con);
    }

    //I believe fastify-websocket only emits 'message' and 'close'. Need to examine other ways to handle this, potentially manually
    con.socket.on("message", OnMessage(server, con, request));

    con.socket.on("close", () => {
      if (con.user) {
        global.rooms.UserDisconnect(con.user);
        global.connections.delete(con.user.id);
      }
    });

    const response: Result = {
      event: Events.OnConnect,
      data: {
        userId: con.user.id,
      },
    };

    con.socket.send(JSON.stringify(response));
  };
