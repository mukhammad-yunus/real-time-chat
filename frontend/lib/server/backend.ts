import "server-only";

import { cookies } from "next/headers";
import { ApiError, unwrap } from "@/lib/api-error";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Cookie", cookieHeader);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers,
    });

    return await unwrap<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "The chat service is unavailable.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }
}
