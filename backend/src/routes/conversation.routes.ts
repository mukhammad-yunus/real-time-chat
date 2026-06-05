import { Router } from "express";
import {
  createConversationController,
  listConversationsController
} from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { createConversationSchema } from "../schemas/conversation.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";

export const conversationRouter = Router();

conversationRouter.use(authenticate);
conversationRouter.get("/", asyncHandler(listConversationsController));
conversationRouter.post("/", validate({ body: createConversationSchema }), asyncHandler(createConversationController));