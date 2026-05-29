import { Router } from "express";
import { registerController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../schemas/auth.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(registerController));