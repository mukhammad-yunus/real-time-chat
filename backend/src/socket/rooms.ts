export function userRoom(userId: string) {
  return `user:${userId}`;
}

export function conversationRoom(conversationId: string) {
  return `conversation:${conversationId}`;
}