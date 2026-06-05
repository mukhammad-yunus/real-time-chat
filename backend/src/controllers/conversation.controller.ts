import type { Request, Response } from "express";
import {
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