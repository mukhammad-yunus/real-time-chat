import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import { assertConversationParticipant } from "./authorization.service.js";
import { Prisma } from "../generated/prisma/client.js";

function getPairKey(userAId: string, userBId: string) {
  return [userAId, userBId].sort().join(":");
}

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
    },
  },
} satisfies Prisma.ConversationInclude;

export async function createPrivateConversation(
  currentUserId: string,
  participantId: string,
) {
  if (currentUserId === participantId) {
    throw new ApiError(
      400,
      "INVALID_PARTICIPANT",
      "You cannot start a conversation with yourself",
    );
  }

  const participant = await prisma.user.findUnique({
    where: { id: participantId },
    select: { id: true },
  });

  if (!participant) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const pairKey = getPairKey(currentUserId, participantId);

  const existing = await prisma.conversation.findUnique({
    where: { pairKey },
    include: conversationInclude,
  });

  if (existing) {
    return existing;
  }

  try {
    return await prisma.conversation.create({
      data: {
        pairKey,
        participants: {
          create: [{ userId: currentUserId }, { userId: participantId }],
        },
      },
      include: conversationInclude,
    });
  } catch (error) {
    // The unique key makes concurrent creates converge on the same conversation.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const conversation = await prisma.conversation.findUnique({
        where: { pairKey },
        include: conversationInclude,
      });
      if (conversation) return conversation;
    }
    throw error;
  }
}

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: conversationInclude,
    orderBy: { updatedAt: "desc" }
  });
}

export async function createMessage(userId: string, conversationId: string, content: string) {
  await assertConversationParticipant(userId, conversationId);

  return prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      },
      reads: true
    }
  });
}

export async function getMessageHistory(userId: string, conversationId: string, cursor?: string, limit = 30) {
  await assertConversationParticipant(userId, conversationId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1
        }
      : {}),
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      },
      reads: true
    }
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  return {
    messages: page.reverse(),
    nextCursor
  };
}

export async function markConversationRead(userId: string, conversationId: string) {
  await assertConversationParticipant(userId, conversationId);

  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId,
      senderId: { not: userId },
      reads: {
        none: { userId }
      }
    },
    select: { id: true }
  });

  await prisma.messageRead.createMany({
    data: unreadMessages.map((message) => ({
      messageId: message.id,
      userId
    })),
    skipDuplicates: true
  });

  return unreadMessages.map((message) => message.id);
}
