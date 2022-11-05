/* eslint-disable @typescript-eslint/no-floating-promises */
import Fastify from 'fastify';
import * as fs from 'fs';
import dotenv from 'dotenv';

import fws, { SocketStream } from '@fastify/websocket';
import fc from '@fastify/cookie';
import { User } from './user/index.js';
import { uuid } from './room/index.js';
import { WsHandler } from './websocket/wsHandler.js';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { DebugSend } from './websocket/debugSend.js';
import { Rooms } from './room/rooms.js';
import { ItemMessage, ItemMessagePayload } from './route/itemMessage.js';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = Fastify({
  logger: true
});
server.register(fws, {
  options: {
    clientTracking: true
  }
});
server.register(fc, {
  secret: 'secret'
});

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

// Websocket stuff should be moved to it's own controller.
export type connection = SocketStream & {
  user?: User
  roomId?: string
  isAlive?: boolean
};

global.rooms = new Rooms();
global.connections = new Map<string, connection>();

server.register(async () => {
  server.route({
    method: 'GET',
    url: '/ws',
    wsHandler: WsHandler(server),
    handler: (req, reply) => {
      reply.status(404).send();
    }
  });
});

server.get('/debug', (request, reply) => {
  if (request.cookies.userId === process.env.ADMIN_ID) {
    const file = join(__dirname, 'view/debug.html');

    const stream = fs.createReadStream(file);
    reply.type('text/html').send(stream);
  } else {
    reply.status(404).send();
  }
});

server.get('/', (request, reply) => {
  const file = join(__dirname, 'view/index.html');
  const stream = fs.createReadStream(file);
  reply.type('text/html').send(stream);
});

server.get('/delete/:roomId', (request, reply) => {
  if (request.cookies.userId === process.env.ADMIN_ID) {
    const { roomId } = request.params as { roomId: uuid };
    global.rooms.DeleteRoom(roomId);
    DebugSend();
  }

  reply.status(200).send();
});

server.put('/received', (request, reply) => {
  console.log(request.body);
  const payload: ItemMessagePayload | null = request?.body as ItemMessagePayload;

  if (payload) {
    const result = ItemMessage(payload);
    if (result.error) {
      reply.code(500);
      reply.send(result);

      return;
    }
    reply.code(200);
  } else {
    reply.code(500);
  }

  reply.send();
});

server.post('/roomExist', (request, reply) => {
  const payload = JSON.parse(request?.body as string)
  if (!payload) {
    reply.code(400);
    reply.send();
    return;
  }

  const { roomName, perma } = payload;
  if (!roomName || !perma) {
    reply.code(400);
    reply.send();
    return;
  }

  const room = global.rooms.FindRoomByName(roomName);
  if (!room) {
    reply.code(403)
  } else {
    if (room.perma !== perma) {
      reply.code(403);
    } else {
      reply.code(200);
    }
  }

  reply.send();
})

server.listen(
  { port: parseInt(process.env.PORT), host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  }
);
