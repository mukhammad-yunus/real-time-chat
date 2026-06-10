export const socketEvents = {
  connection: "connection",
  disconnect: "disconnect",
  conversationJoin: "conversation:join",
  messageSend: "message:send",
  messageNew: "message:new",
  messageDelivered: "message:delivered",
  messageRead: "message:read",
  typingStart: "typing:start",
  typingStop: "typing:stop",
  presenceOnline: "presence:online",
  presenceOffline: "presence:offline",
  socketError: "socket:error"
} as const;