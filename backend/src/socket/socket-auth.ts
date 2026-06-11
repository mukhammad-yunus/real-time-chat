import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { authCookieName } from "../utils/auth-cookie.js";

type SocketUser = {
  id: string;
  username: string;
};

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

function parseCookies(cookieHeader?: string) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey && rawValue.length > 0) {
      cookies.set(rawKey, decodeURIComponent(rawValue.join("=")));
    }
  }

  return cookies;
}

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.get(authCookieName);

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true
      }
    });

    if (!user) {
      next(new Error("Authentication required"));
      return;
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication required"));
  }
}