import type { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma.js";
import { assertConversationParticipant } from "../services/authorization.service.js";
import { createMessage, markConversationRead } from "../services/conversation.service.js";
import { socketEvents } from "./socket-events.js";
import { addUserSocket, removeUserSocket } from "./presence-store.js";
import { conversationRoom, userRoom } from "./rooms.js";

export function registerSocketHandlers(io: Server) {
  io.on(socketEvents.connection, async (socket: Socket) => {
    const user = socket.user!;
    socket.join(userRoom(user.id));

    const socketCount = addUserSocket(user.id, socket.id);
    if (socketCount === 1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true }
      });
      io.emit(socketEvents.presenceOnline, { userId: user.id });
    }

    socket.on(socketEvents.conversationJoin, async ({ conversationId }: { conversationId: string }) => {
      try {
        await assertConversationParticipant(user.id, conversationId);
        socket.join(conversationRoom(conversationId));
      } catch {
        socket.emit(socketEvents.socketError, { message: "Cannot join conversation" });
      }
    });

    socket.on(socketEvents.disconnect, async () => {
      const remaining = removeUserSocket(user.id, socket.id);
      if (remaining === 0) {
        const lastSeenAt = new Date();
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isOnline: false,
            lastSeenAt
          }
        });
        io.emit(socketEvents.presenceOffline, { userId: user.id, lastSeenAt });
      }
    });
  });
}