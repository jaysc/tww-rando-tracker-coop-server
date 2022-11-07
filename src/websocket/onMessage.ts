import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData } from 'ws';
import { ParseData } from './index.js';
import type { connection } from '../index.js';
import { DebugSend } from './debugSend.js';
import * as _ from 'lodash-es';
import { Events } from '../actions/events.js';

export interface WebsocketResponse {
  data?: object
  error?: string
  event: Events
  message?: string
  messageId?: string
}

export const OnMessage =
  (server: FastifyInstance, con: connection, request: FastifyRequest) =>
    (message: RawData) => {
      const messageString = message.toString();
      if (messageString === 'PONG') {
        con.isAlive = true;
        return;
      }

      try {
        if (
          request.cookies.userId === process.env.ADMIN_ID &&
        _.get(JSON.parse(messageString), 'debug')
        ) {
          global.debugClient = con;
          console.log('Set debug client');
          DebugSend();
        }
      } catch {}

      if (!con.user) {
        console.error('Missing userId');
        con.socket.close();
        return;
      }

      const { action, messageId } = ParseData(message, con.user) ?? {};

      if (action == null) {
      // Not json, do nothing.
        return;
      }

      const result = action.execute(server.websocketServer);

      DebugSend();

      const response: WebsocketResponse = {
        data: result.data,
        error: result.error?.message,
        event: result.event,
        message: result.message,
        messageId
      };

      console.log(result);
      con.socket.send(JSON.stringify(response));
    };
