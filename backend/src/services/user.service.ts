import { prisma } from "../config/prisma.js";

export async function searchUsers(currentUserId: string, query: string) {
  return prisma.user.findMany({
    where: {
      id: {
        not: currentUserId
      },
      username: {
        contains: query.toLowerCase(),
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
      isOnline: true,
      lastSeenAt: true
    },
    orderBy: {
      username: "asc"
    },
    take: 10
  });
}