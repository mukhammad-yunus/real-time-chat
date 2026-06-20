"use server";

import { backendFetch } from "@/lib/server/backend";
import type { Conversation } from "@/types/api";

export type CreateConversationState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; conversation: Conversation };

export async function createConversationAction(
  _previous: CreateConversationState,
  formData: FormData,
): Promise<CreateConversationState> {
  const participantId = formData.get("participantId");

  if (typeof participantId !== "string" || !participantId) {
    return { status: "error", message: "Choose a user first." };
  }

  try {
    const data = await backendFetch<{ conversation: Conversation }>(
      "/api/conversations",
      {
        method: "POST",
        body: JSON.stringify({ participantId }),
      },
    );
    return { status: "success", conversation: data.conversation };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not start conversation.",
    };
  }
}
