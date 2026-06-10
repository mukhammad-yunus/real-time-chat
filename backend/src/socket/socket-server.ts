import type http from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

export function createSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: env.FRONTEND_ORIGIN,
      credentials: true
    }
  });
  return io;
}
