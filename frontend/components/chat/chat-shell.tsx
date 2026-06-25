"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { createChatSocket, type ChatSocket } from "@/lib/socket";
import { chatReducer } from "@/lib/chat-state";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { MessagePanel } from "@/components/chat/message-panel";
import type { Conversation, MessagePage, SessionUser } from "@/types/api";
import type { Route } from "next";

type Props = {
  currentUser: SessionUser;
  initialConversations: Conversation[];
  activeConversationId: string | null;
  initialPage: MessagePage | null;
};

export function ChatShell({
  currentUser,
  initialConversations,
  activeConversationId,
  initialPage,
}: Props) {
  const router = useRouter();
  const socketRef = useRef<ChatSocket | null>(null);
  const activeConversationIdRef = useRef(activeConversationId);
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: initialConversations,
    messages: initialPage?.messages ?? [],
    nextCursor: initialPage?.nextCursor ?? null,
    typingUsers: {},
  });

  if (!socketRef.current) socketRef.current = createChatSocket();
  const socket = socketRef.current;

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const activeConversation = useMemo(
    () => state.conversations.find((item) => item.id === activeConversationId),
    [state.conversations, activeConversationId],
  );

  useEffect(() => {
    function joinActiveConversation() {
      const conversationId = activeConversationIdRef.current;
      if (!conversationId) return;
      socket.emit("conversation:join", { conversationId });
      socket.emit("message:read", { conversationId });
    }

    socket.on("message:new", ({ message }) => {
      if (message.conversationId === activeConversationIdRef.current) {
        dispatch({ type: "messageReceived", message });
        if (
          message.senderId !== currentUser.id &&
          document.visibilityState === "visible"
        ) {
          socket.emit("message:read", {
            conversationId: message.conversationId,
          });
        }
      } else {
        router.refresh();
      }
    });

    socket.on("message:delivered", ({ messageId, deliveredAt }) => {
      dispatch({ type: "delivered", messageId, deliveredAt });
    });

    socket.on("message:read", ({ userId, messageIds, readAt }) => {
      dispatch({
        type: "read",
        messageIds,
        read: { id: `${userId}-${readAt}`, userId, messageId: "", readAt },
      });
    });

    socket.on("typing:start", ({ conversationId, username }) => {
      dispatch({ type: "typing", conversationId, username });
    });
    socket.on("typing:stop", ({ conversationId }) => {
      dispatch({ type: "typing", conversationId });
    });
    socket.on("presence:online", ({ userId }) => {
      dispatch({ type: "presence", userId, isOnline: true });
    });
    socket.on("presence:offline", ({ userId, lastSeenAt }) => {
      dispatch({ type: "presence", userId, isOnline: false, lastSeenAt });
    });
    socket.on("connect", joinActiveConversation);
    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket, currentUser.id, router]);

  useEffect(() => {
    if (!activeConversationId || !socket.connected) return;

    socket.emit("conversation:join", {
      conversationId: activeConversationId,
    });
    socket.emit("message:read", {
      conversationId: activeConversationId,
    });
  }, [socket, activeConversationId]);

  const addConversation = useCallback(
    (conversation: Conversation) => {
      dispatch({ type: "conversationAdded", conversation });
      router.push(`/chat/${conversation.id}` as Route);
    },
    [router],
  );

  return (
    <main className="grid h-dvh overflow-hidden bg-white md:grid-cols-[22rem_1fr]">
      <ConversationSidebar
        currentUser={currentUser}
        conversations={state.conversations}
        activeConversationId={activeConversationId}
        onConversationAdded={addConversation}
      />
      <MessagePanel
        currentUser={currentUser}
        conversation={activeConversation}
        messages={state.messages}
        nextCursor={state.nextCursor}
        typingUsername={
          activeConversationId
            ? state.typingUsers[activeConversationId]
            : undefined
        }
        socket={socket}
        dispatch={dispatch}
      />
    </main>
  );
}
