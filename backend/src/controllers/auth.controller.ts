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