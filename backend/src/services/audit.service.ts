import type { AuditAction } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

type AuditInput = {
  action: AuditAction;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null
    }
  });
}