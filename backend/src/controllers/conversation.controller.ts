import type { Request, Response } from "express";
import {
  createMessage,
  createPrivateConversation,
  listConversations
} from "../services/conversation.service.js";

export async function listConversationsController(req: Request, res: Response) {
  const conversations = await listConversations(req.user!.id);

  res.json({
    ok: true,
    data: { conversations }
  });
}

export async function createConversationController(req: Request, res: Response) {
  const conversation = await createPrivateConversation(req.user!.id, req.body.participantId);

  res.status(201).json({
    ok: true,
    data: { conversation }
  });
}

export async function sendMessageController(req: Request, res: Response) {
  const message = await createMessage(req.user!.id, req.params.conversationId as string, req.body.content);

  res.status(201).json({
    ok: true,
    data: { message }
  });
}