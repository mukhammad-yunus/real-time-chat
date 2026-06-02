import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";

export async function assertConversationParticipant(userId: string, conversationId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId
      }
    }
  });

  if (!participant) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this conversation");
  }
}