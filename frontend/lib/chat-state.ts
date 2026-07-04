import type {
  Conversation,
  Message,
  MessageRead,
  PublicUser,
} from "@/types/api";

export type PendingMessage = Message & {
  clientId: string;
  status: "sending" | "failed";
};

export type DisplayMessage = Message | PendingMessage;

export type ChatState = {
  conversations: Conversation[];
  messages: DisplayMessage[];
  nextCursor: string | null;
  typingUsers: Record<string, string>;
};

export type ChatAction =
  | { type: "olderLoaded"; messages: Message[]; nextCursor: string | null }
  | { type: "messageReceived"; message: Message; clientMessageId?: string }
  | { type: "conversationMessageReceived"; message: Message; currentUserId: string }
  | { type: "messageQueued"; message: PendingMessage }
  | { type: "messageFailed"; clientId: string }
  | { type: "delivered"; messageId: string; deliveredAt: string }
  | {
      type: "read";
      conversationId: string;
      messageIds: string[];
      read: Pick<MessageRead, "userId" | "readAt">;
      currentUserId: string;
    }
  | { type: "presence"; userId: string; isOnline: boolean; lastSeenAt?: string }
  | { type: "typing"; conversationId: string; username?: string }
  | { type: "conversationAdded"; conversation: Conversation };

function upsertMessage(
  messages: DisplayMessage[],
  incoming: Message,
  clientMessageId?: string,
) {
  const withoutServerDuplicate = messages.filter(
    (item) =>
      item.id !== incoming.id &&
      !("clientId" in item && item.clientId === clientMessageId),
  );
  return [...withoutServerDuplicate, incoming].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "olderLoaded":
      return {
        ...state,
        messages: [...action.messages, ...state.messages],
        nextCursor: action.nextCursor,
      };
    case "messageReceived": {
      const preview = {
        id: action.message.id,
        content: action.message.content,
        createdAt: action.message.createdAt,
        senderId: action.message.senderId,
      };
      return {
        ...state,
        messages: upsertMessage(state.messages, action.message, action.clientMessageId),
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.message.conversationId
            ? { ...conversation, messages: [preview] }
            : conversation,
        ),
      };
    }
    case "messageQueued":
      return { ...state, messages: [...state.messages, action.message] };
    case "conversationMessageReceived": {
      const preview = {
        id: action.message.id,
        content: action.message.content,
        createdAt: action.message.createdAt,
        senderId: action.message.senderId,
      };
      const conversations = state.conversations.map((conversation) =>
        conversation.id === action.message.conversationId
          ? {
              ...conversation,
              messages: [preview],
              unreadCount:
                conversation.unreadCount +
                Number(action.message.senderId !== action.currentUserId),
            }
          : conversation,
      );
      const updated = conversations.find(
        (conversation) => conversation.id === action.message.conversationId,
      );
      return {
        ...state,
        conversations: updated
          ? [updated, ...conversations.filter((conversation) => conversation !== updated)]
          : conversations,
      };
    }
    case "messageFailed":
      return {
        ...state,
        messages: state.messages.map((item) =>
          "clientId" in item && item.clientId === action.clientId
            ? { ...item, status: "failed" }
            : item,
        ),
      };
    case "delivered":
      return {
        ...state,
        messages: state.messages.map((item) =>
          item.id === action.messageId
            ? { ...item, deliveredAt: action.deliveredAt }
            : item,
        ),
      };
    case "read":
      return {
        ...state,
        messages: state.messages.map((item) =>
          action.messageIds.includes(item.id) &&
          !item.reads.some((read) => read.userId === action.read.userId)
            ? {
                ...item,
                reads: [
                  ...item.reads,
                  {
                    id: `${item.id}-${action.read.userId}-${action.read.readAt}`,
                    messageId: item.id,
                    ...action.read,
                  },
                ],
              }
            : item,
        ),
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId &&
          action.read.userId === action.currentUserId
            ? {
                ...conversation,
                unreadCount: Math.max(
                  0,
                  conversation.unreadCount - action.messageIds.length,
                ),
              }
            : conversation,
        ),
      };
    case "presence":
      return {
        ...state,
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((participant) =>
            participant.user.id === action.userId
              ? {
                  ...participant,
                  user: {
                    ...participant.user,
                    isOnline: action.isOnline,
                    lastSeenAt:
                      action.lastSeenAt ?? participant.user.lastSeenAt,
                  },
                }
              : participant,
          ),
        })),
      };
    case "typing": {
      const typingUsers = { ...state.typingUsers };
      if (action.username) typingUsers[action.conversationId] = action.username;
      else delete typingUsers[action.conversationId];
      return { ...state, typingUsers };
    }
    case "conversationAdded":
      return {
        ...state,
        conversations: [
          action.conversation,
          ...state.conversations.filter(
            (item) => item.id !== action.conversation.id,
          ),
        ],
      };
  }
}

export function otherParticipant(
  conversation: Conversation,
  currentUserId: string,
): PublicUser | undefined {
  return conversation.participants.find(
    (participant) => participant.user.id !== currentUserId,
  )?.user;
}
