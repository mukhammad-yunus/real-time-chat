import type { Request, Response } from "express";
import { registerUser } from "../services/auth.service.js";
import { getRequestInfo } from "../utils/request-info.js";

export async function registerController(req: Request, res: Response) {
  const user = await registerUser(req.body, getRequestInfo(req));

  res.status(201).json({
    ok: true,
    data: {
      user
    }
  });
}

import { loginUser } from "../services/auth.service.js";
import { setAuthCookie } from "../utils/auth-cookie.js";

export async function loginController(req: Request, res: Response) {
  const result = await loginUser(req.body, getRequestInfo(req));
  setAuthCookie(res, result.token);
  
  res.json({
    ok: true,
    data: {
      user: result.user,
    }
  });
}