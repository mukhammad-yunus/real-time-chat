import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import { authCookieName } from "../utils/auth-cookie.js";

type JwtPayload = {
  userId: string;
};

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[authCookieName];

  if (!token) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true
    }
  });

  if (!user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  req.user = user;
  next();
}