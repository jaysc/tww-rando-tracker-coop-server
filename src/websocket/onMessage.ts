import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RawData } from "ws";
import { ParseData } from "./index.js";
import type { connection } from "../index.js";
import { DebugSend } from "./debugSend.js";
import * as _ from "lodash-es";
import { Events, Result } from "../actions/index.js";

export const OnMessage =
  (server: FastifyInstance, con: connection, request: FastifyRequest) =>
  (message: RawData) => {
    try {
      if (
        request.cookies.userId == process.env.ADMIN_ID &&
        _.get(JSON.parse(message.toString()), "debug")
      ) {
        global.debugClient = con;
        console.log("Set debug client");
        DebugSend();
      }
    } catch {}

    if (!con.user) {
      console.error("Missing userId");
      con.socket.close();
      return;
    }

    const { action, messageId } = ParseData(message, con.user) ?? {};

    if (action == null) {
      //Not json, do nothing.
      return;
    }

    const result = action.execute(server.websocketServer);

    DebugSend();

    const response: Result = {
      event: result.event || Events.Response,
      messageId,
      message: result.message,
      err: result.err,
      data: result.data,
    };

    console.log(result);
    con.socket.send(JSON.stringify(response));
  };
