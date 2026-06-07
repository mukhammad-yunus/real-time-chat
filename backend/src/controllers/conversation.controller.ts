import type { Request, Response } from "express";
import {
  createMessage,
  createPrivateConversation,
  getMessageHistory,
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

export async function messageHistoryController(req: Request, res: Response) {
  const result = await getMessageHistory(
    req.user!.id,
    req.params.conversationId as string,
    req.query.cursor ? String(req.query.cursor) : undefined,
    Number(req.query.limit)
  );

  res.json({
    ok: true,
    data: result
  });
}