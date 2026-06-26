import { getConversations } from "@/lib/server/chat";
import { getCurrentUser } from "@/lib/server/session";
import { ChatShell } from "@/components/chat/chat-shell";

export const metadata = { title: "Messages" };

export default async function ChatIndexPage() {
  const [user, conversations] = await Promise.all([
    getCurrentUser(),
    getConversations(),
  ]);

  return (
    <ChatShell
      key="chat-index"
      currentUser={user!}
      initialConversations={conversations}
      activeConversationId={null}
      initialPage={null}
    />
  );
}
