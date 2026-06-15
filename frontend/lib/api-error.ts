import type { ApiEnvelope } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function unwrap<T>(response: Response): Promise<T> {
  let payload: ApiEnvelope<T>;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(
      "The server returned an unreadable response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok || !payload.ok) {
    const failure = payload as Extract<ApiEnvelope<T>, { ok: false }>;
    throw new ApiError(
      failure.error.message,
      response.status,
      failure.error.code,
      failure.error.details,
    );
  }

  return payload.data;
}
