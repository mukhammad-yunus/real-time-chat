import { z } from "zod";

export const createConversationSchema = z.object({
  participantId: z.string().min(1, "Participant is required")
});

export const conversationParamsSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required")
});

export const messageHistoryQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30)
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long")
});