import type { Request } from "express";

export function getRequestInfo(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null
  };
}