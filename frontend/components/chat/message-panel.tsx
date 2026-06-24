"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, type Dispatch } from "react";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { unwrap } from "@/lib/api-error";
import {
  otherParticipant,
  type ChatAction,
  type DisplayMessage,
} from "@/lib/chat-state";
import type { ChatSocket } from "@/lib/socket";
import type { Conversation, MessagePage, SessionUser } from "@/types/api";
import type { Route } from "next";

type Props = {
  currentUser: SessionUser;
  conversation?: Conversation;
  messages: DisplayMessage[];
  nextCursor: string | null;
  typingUsername?: string;
  socket: ChatSocket;
  dispatch: Dispatch<ChatAction>;
};

export function MessagePanel({
  currentUser,
  conversation,
  messages,
  nextCursor,
  typingUsername,
  socket,
  dispatch,
}: Props) {
  const [loadingOlder, setLoadingOlder] = useState(false);

  if (!conversation) {
    return (
      <section className="hidden place-items-center bg-white md:grid">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-4xl">Choose a conversation</h1>
          <p className="mt-3 text-ink-700">
            Select someone from the left, or search for a new person.
          </p>
        </div>
      </section>
    );
  }

  const other = otherParticipant(conversation, currentUser.id);

  async function loadOlder() {
    if (!nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const response = await fetch(
        `/api/backend/api/conversations/${conversation!.id}/messages?cursor=${encodeURIComponent(nextCursor)}&limit=30`,
      );
      const page = await unwrap<MessagePage>(response);
      dispatch({ type: "olderLoaded", ...page });
    } finally {
      setLoadingOlder(false);
    }
  }

  function send(content: string) {
    const clientId = crypto.randomUUID();
    dispatch({
      type: "messageQueued",
      message: {
        id: `pending:${clientId}`,
        clientId,
        status: "sending",
        conversationId: conversation!.id,
        senderId: currentUser.id,
        content,
        deliveredAt: null,
        createdAt: new Date().toISOString(),
        sender: { id: currentUser.id, username: currentUser.username },
        reads: [],
      },
    });

    if (!socket.connected) {
      dispatch({ type: "messageFailed", clientId });
      return;
    }

    socket.emit("message:send", {
      conversationId: conversation!.id,
      content,
    });
  }

  return (
    <section
      className="flex min-h-0 flex-col"
      aria-label={`Conversation with ${other?.username}`}
    >
      <header className="flex min-h-16 items-center gap-3 border-b px-4 sm:px-6">
        <Link
          href={"/chat" as Route}
          className="grid h-10 w-10 place-items-center rounded-xl hover:bg-mist-100 md:hidden"
        >
          <ArrowLeft aria-hidden="true" size={19} />
          <span className="sr-only">Back to conversations</span>
        </Link>
        <div>
          <h1 className="font-semibold">@{other?.username}</h1>
          <p className="text-xs text-ink-700" aria-live="polite">
            {typingUsername
              ? `${typingUsername} is typing…`
              : other?.isOnline
                ? "Online"
                : other?.lastSeenAt
                  ? `Last seen ${new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(other.lastSeenAt))}`
                  : "Offline"}
          </p>
        </div>
      </header>

      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        hasOlder={Boolean(nextCursor)}
        loadingOlder={loadingOlder}
        onLoadOlder={loadOlder}
      />

      <MessageComposer
        conversationId={conversation.id}
        socket={socket}
        onSend={send}
      />
    </section>
  );
}
