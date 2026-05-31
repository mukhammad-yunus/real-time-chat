import type { Response } from "express";
import { env } from "../config/env.js";

const authCookieName = "rtc_auth";

export function setAuthCookie(res: Response, token: string) {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/"
  });
}

export { authCookieName };