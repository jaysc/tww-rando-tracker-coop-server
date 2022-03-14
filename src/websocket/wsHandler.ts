import type { FastifyInstance, FastifyRequest } from "fastify";
import { OnMessage } from "./onMessage.js";
import type { connection } from "../index.js";
import { User } from "../user/index.js";
import { Events, Result } from "../actions/index.js";
import { DebugSend } from "./debugSend.js";

export const WsHandler =
  (server: FastifyInstance) => (con: connection, request: FastifyRequest) => {
    //'Connection' event
    if (!con.user) {
      const userId = request.cookies.userId;
      con.user = new User(userId);
      con.isAlive = true;

      global.connections.set(con.user.id, con);
    }

    const handleHearbeat = () => {
      if (global.connections.size == 0 && global.heartBeat) {
        clearInterval(global.heartBeat);
        global.heartBeat = null;
      }
    };

    if (!global.heartBeat) {
      global.heartBeat = setInterval(() => {
        global.connections.forEach((con) => {
          if (!con.isAlive) {
            console.log("Terminating: " + con.user?.id);
            con.socket.terminate();
            return;
          }
          con.isAlive = false;
          con.socket.send("PING");
        });
        handleHearbeat();
      }, parseInt(process.env.PING_INTERVAL) ?? 30000);
    }

    //I believe fastify-websocket only emits 'message' and 'close'. Need to examine other ways to handle this, potentially manually
    con.socket.on("message", OnMessage(server, con, request));

    con.socket.on("close", () => {
      if (con.user) {
        global.rooms.UserDisconnect(con.user);
        global.connections.delete(con.user.id);
        DebugSend();
      }

      handleHearbeat();
    });

    const response: Result = {
      event: Events.OnConnect,
      data: {
        userId: con.user.id,
      },
    };

    con.socket.send(JSON.stringify(response));
    DebugSend();
  };
