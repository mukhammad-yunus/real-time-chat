import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import { assertConversationParticipant } from "./authorization.service.js";

function getPairKey(userAId: string, userBId: string) {
  return [userAId, userBId].sort().join(":");
}

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
    include: {
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
    },
  });

  if (existing && existing.participants.length === 2) {
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        pairKey,
        participants: {
          create: [{ userId: currentUserId }, { userId: participantId }],
        },
      },
    });

    void pairKey;
    return conversation;
  });
}
