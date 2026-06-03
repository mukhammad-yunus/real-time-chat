import { Router } from "express";
import { searchUsersController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { searchUsersQuerySchema } from "../schemas/user.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";

export const userRouter = Router();

userRouter.get(
  "/search",
  authenticate,
  validate({ query: searchUsersQuerySchema }),
  asyncHandler(searchUsersController)
);