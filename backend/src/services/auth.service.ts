import bcrypt from "bcrypt";
import { AuditAction, Prisma } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schemas.js";
import { createAuditLog } from "./audit.service.js";

type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  createdAt: true
} satisfies Prisma.UserSelect;

export async function registerUser(input: RegisterInput, meta: RequestMeta) {
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_COST);

  try {
    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash
      },
      select: publicUserSelect
    });

    await createAuditLog({
      action: AuditAction.REGISTER,
      userId: user.id,
      ...meta
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "REGISTRATION_CONFLICT", "Username or email is already in use");
    }

    throw error;
  }
}