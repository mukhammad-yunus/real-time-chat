const userSockets = new Map<string, Set<string>>();

export function addUserSocket(userId: string, socketId: string) {
  const sockets = userSockets.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
  return sockets.size;
}

export function removeUserSocket(userId: string, socketId: string) {
  const sockets = userSockets.get(userId);
  if (!sockets) return 0;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSockets.delete(userId);
    return 0;
  }

  return sockets.size;
}

export function isUserConnected(userId: string) {
  return userSockets.has(userId);
}