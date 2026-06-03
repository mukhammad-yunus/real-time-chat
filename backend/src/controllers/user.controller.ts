import type { Request, Response } from "express";
import { searchUsers } from "../services/user.service.js";

export async function searchUsersController(req: Request, res: Response) {
  const users = await searchUsers(req.user!.id, String(req.query.q));

  res.json({
    ok: true,
    data: {
      users
    }
  });
}