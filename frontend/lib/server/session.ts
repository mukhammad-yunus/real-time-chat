import "server-only";

import { cache } from "react";
import { ApiError } from "@/lib/api-error";
import { backendFetch } from "@/lib/server/backend";
import type { SessionUser } from "@/types/api";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const data = await backendFetch<{ user: SessionUser }>("/api/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
