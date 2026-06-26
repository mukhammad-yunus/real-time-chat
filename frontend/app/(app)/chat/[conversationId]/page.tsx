import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { ChatShell } from "@/components/chat/chat-shell";
import { getConversations, getMessages } from "@/lib/server/chat";
import { getCurrentUser } from "@/lib/server/session";

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { conversationId } = await params;
  const [user, conversations] = await Promise.all([
    getCurrentUser(),
    getConversations(),
  ]);
  const active = conversations.find((item) => item.id === conversationId);
  const other = active?.participants.find(
    (item) => item.user.id !== user?.id,
  )?.user;

  return { title: other ? `@${other.username}` : "Conversation" };
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  try {
    const [user, conversations, initialPage] = await Promise.all([
      getCurrentUser(),
      getConversations(),
      getMessages(conversationId),
    ]);

    if (!conversations.some((item) => item.id === conversationId)) notFound();

    return (
      <ChatShell
        key={conversationId}
        currentUser={user!}
        initialConversations={conversations}
        activeConversationId={conversationId}
        initialPage={initialPage}
      />
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 403 || error.status === 404)
    ) {
      notFound();
    }
    throw error;
  }
}
