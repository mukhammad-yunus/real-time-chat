import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createChatSocket(): ChatSocket {
  return io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
    autoConnect: false,
    withCredentials: true,
  });
}
