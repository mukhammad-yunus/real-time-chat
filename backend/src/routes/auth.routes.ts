import { Router } from "express";
import { loginController, logoutController, meController, registerController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { asyncHandler } from "../utils/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(registerController));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(loginController));
authRouter.post("/logout", asyncHandler(logoutController));
authRouter.get("/me", authenticate, asyncHandler(meController));