import type { Message } from "@/types/api";

export interface ServerToClientEvents {
  "message:new": (payload: { message: Message; clientMessageId?: string }) => void;
  "message:delivered": (payload: {
    messageId: string;
    deliveredAt: string;
  }) => void;
  "message:read": (payload: {
    conversationId: string;
    userId: string;
    messageIds: string[];
    readAt: string;
  }) => void;
  "typing:start": (payload: {
    conversationId: string;
    userId: string;
    username: string;
  }) => void;
  "typing:stop": (payload: { conversationId: string; userId: string }) => void;
  "presence:online": (payload: { userId: string }) => void;
  "presence:offline": (payload: { userId: string; lastSeenAt: string }) => void;
  "socket:error": (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  "conversation:join": (payload: { conversationId: string }) => void;
  "message:send": (payload: {
    conversationId: string;
    content: string;
    clientMessageId: string;
  }) => void;
  "message:read": (payload: { conversationId: string }) => void;
  "typing:start": (payload: { conversationId: string }) => void;
  "typing:stop": (payload: { conversationId: string }) => void;
}
