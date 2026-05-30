import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(registerController));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(loginController));