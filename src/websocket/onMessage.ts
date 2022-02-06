import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RawData } from "ws";
import { ParseData } from "./index.js";
import type { connection } from "../index.js";
import { User } from "../user/index.js";
import { DebugSend } from "./debugSend.js";
import * as _ from "lodash-es";

export const OnMessage =
  (server: FastifyInstance, con: connection, request: FastifyRequest) =>
  (message: RawData) => {
    console.log(con.user);

    try {
      if (_.get(JSON.parse(message.toString()), "debug")) {
        global.debugClient = con;
        console.log("Set debug client");
        DebugSend();
      }
    } catch {}

    if (!con.user) {
      const userId = request.cookies.userId;
      con.user = new User(userId);
    }

    const action = ParseData(message, con.user);

    if (action == null) {
      //Not json, do nothing.
      return;
    }

    const result = action.execute(server.websocketServer);

    DebugSend();

    console.log(result);
    con.socket.send(
      JSON.stringify({
        message: result.message,
        err: result.err?.message,
      })
    );
  };
