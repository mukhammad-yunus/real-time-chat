import { Router } from "express";
import {
  createConversationController,
  listConversationsController,
  sendMessageController
} from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { conversationParamsSchema, createConversationSchema, sendMessageSchema } from "../schemas/conversation.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";

export const conversationRouter = Router();

conversationRouter.use(authenticate);
conversationRouter.get("/", asyncHandler(listConversationsController));
conversationRouter.post("/", validate({ body: createConversationSchema }), asyncHandler(createConversationController));
conversationRouter.post(
  "/:conversationId/messages",
  validate({ params: conversationParamsSchema, body: sendMessageSchema }),
  asyncHandler(sendMessageController)
);