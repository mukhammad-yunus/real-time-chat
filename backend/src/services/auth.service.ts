import bcrypt from "bcrypt";
import { AuditAction, Prisma } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schemas.js";
import { createAuditLog } from "./audit.service.js";
import jwt, { SignOptions } from "jsonwebtoken";

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


export type AuthTokenPayload = {
  userId: string;
};

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  });
}

export async function loginUser(input: LoginInput, meta: RequestMeta) {
  const identifier = input.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }]
    }
  });

  if (!user) {
    await createAuditLog({
      action: AuditAction.LOGIN_FAILED,
      ...meta
    });
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid username, email, or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    await createAuditLog({
      action: AuditAction.LOGIN_FAILED,
      userId: user.id,
      ...meta
    });
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid username, email, or password");
  }

  await createAuditLog({
    action: AuditAction.LOGIN_SUCCESS,
    userId: user.id,
    ...meta
  });

  const token = signAuthToken({ userId: user.id });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }
  };
}