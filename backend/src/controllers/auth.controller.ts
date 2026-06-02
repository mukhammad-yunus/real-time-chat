import type { Request, Response } from "express";
import { registerUser } from "../services/auth.service.js";
import { getRequestInfo } from "../utils/request-info.js";
import { AuditAction } from "../generated/prisma/client.js";

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
import { clearAuthCookie, setAuthCookie } from "../utils/auth-cookie.js";
import { createAuditLog } from "../services/audit.service.js";

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

export async function logoutController(req: Request, res: Response) {
  clearAuthCookie(res);

  await createAuditLog({
    action: AuditAction.LOGOUT,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null
  });

  res.json({
    ok: true,
    data: {
      message: "Logged out"
    }
  });
}

export async function meController(req: Request, res: Response) {
  res.json({
    ok: true,
    data: {
      user: req.user
    }
  });
}
