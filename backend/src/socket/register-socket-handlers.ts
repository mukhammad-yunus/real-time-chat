import type { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma.js";
import { assertConversationParticipant } from "../services/authorization.service.js";
import {
  createMessage,
  markConversationRead,
} from "../services/conversation.service.js";
import { socketEvents } from "./socket-events.js";
import { addUserSocket, removeUserSocket } from "./presence-store.js";
import { conversationRoom, userRoom } from "./rooms.js";

async function conversationUserRooms(conversationId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return participants.map((participant) => userRoom(participant.userId));
}

export function registerSocketHandlers(io: Server) {
  io.on(socketEvents.connection, async (socket: Socket) => {
    const user = socket.user!;
    socket.join(userRoom(user.id));

    const socketCount = addUserSocket(user.id, socket.id);
    if (socketCount === 1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });
      io.emit(socketEvents.presenceOnline, { userId: user.id });
    }

    socket.on(
      socketEvents.conversationJoin,
      async ({ conversationId }: { conversationId: string }) => {
        try {
          await assertConversationParticipant(user.id, conversationId);
          socket.join(conversationRoom(conversationId));
        } catch {
          socket.emit(socketEvents.socketError, {
            message: "Cannot join conversation",
          });
        }
      },
    );
    socket.on(
      socketEvents.messageSend,
      async ({
        conversationId,
        content,
        clientMessageId,
      }: {
        conversationId: string;
        content: string;
        clientMessageId?: string;
      }) => {
        try {
          const message = await createMessage(user.id, conversationId, content);
          const rooms = await conversationUserRooms(conversationId);
          socket.to(rooms).emit(
            socketEvents.messageNew,
            { message },
          );

          if (clientMessageId) {
            socket.emit(socketEvents.messageNew, { message, clientMessageId });
          }

          const deliveredAt = new Date();
          await prisma.message.update({
            where: { id: message.id },
            data: { deliveredAt },
          });
          io.to(rooms).emit(
            socketEvents.messageDelivered,
            {
              messageId: message.id,
              deliveredAt,
            },
          );
        } catch {
          socket.emit(socketEvents.socketError, {
            message: "Message could not be sent",
          });
        }
      },
    );
    socket.on(socketEvents.messageRead, async ({ conversationId }: { conversationId: string }) => {
      try {
        const messageIds = await markConversationRead(user.id, conversationId);
        const rooms = await conversationUserRooms(conversationId);
        io.to(rooms).emit(socketEvents.messageRead, {
          conversationId,
          userId: user.id,
          messageIds,
          readAt: new Date()
        });
      } catch {
        socket.emit(socketEvents.socketError, { message: "Messages could not be marked read" });
      }
    });

    socket.on(socketEvents.typingStart, async ({ conversationId }: { conversationId: string }) => {
      try {
        await assertConversationParticipant(user.id, conversationId);
        socket.to(conversationRoom(conversationId)).emit(socketEvents.typingStart, {
          conversationId,
          userId: user.id,
          username: user.username
        });
      } catch {
        socket.emit(socketEvents.socketError, { message: "Typing event rejected" });
      }
    });

    socket.on(socketEvents.typingStop, async ({ conversationId }: { conversationId: string }) => {
      try {
        await assertConversationParticipant(user.id, conversationId);
        socket.to(conversationRoom(conversationId)).emit(socketEvents.typingStop, {
          conversationId,
          userId: user.id
        });
      } catch {
        socket.emit(socketEvents.socketError, { message: "Typing event rejected" });
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
            lastSeenAt,
          },
        });
        io.emit(socketEvents.presenceOffline, { userId: user.id, lastSeenAt });
      }
    });
  });
}
