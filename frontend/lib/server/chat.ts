import "server-only";

import { backendFetch } from "@/lib/server/backend";
import type { Conversation, MessagePage, PublicUser } from "@/types/api";

export async function getConversations() {
  const data = await backendFetch<{ conversations: Conversation[] }>(
    "/api/conversations",
  );
  return data.conversations;
}

export async function getMessages(conversationId: string, cursor?: string) {
  const query = new URLSearchParams({ limit: "30" });
  if (cursor) query.set("cursor", cursor);

  return backendFetch<MessagePage>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages?${query}`,
  );
}

export async function searchUsers(query: string) {
  const data = await backendFetch<{ users: PublicUser[] }>(
    `/api/users/search?q=${encodeURIComponent(query)}`,
  );
  return data.users;
}
