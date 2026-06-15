export type ApiErrorBody = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;

export type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export type PublicUser = {
  id: string;
  username: string;
  createdAt?: string;
  isOnline: boolean;
  lastSeenAt: string | null;
};

export type MessageRead = {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deliveredAt: string | null;
  createdAt: string;
  sender: Pick<PublicUser, "id" | "username">;
  reads: MessageRead[];
};

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{ user: PublicUser }>;
  messages?: Array<Pick<Message, "id" | "content" | "createdAt" | "senderId">>;
};

export type MessagePage = {
  messages: Message[];
  nextCursor: string | null;
};
