"use client";

import { useEffect, useState } from "react";
import type { PublicUser } from "@/types/api";

const ONLINE_GRACE_PERIOD_MS = 60_000;

export function isUserOnline(
  user: Pick<PublicUser, "isOnline" | "lastSeenAt">,
  now = Date.now(),
) {
  if (user.isOnline) return true;
  if (!user.lastSeenAt) return false;

  const lastSeenAt = Date.parse(user.lastSeenAt);
  return (
    Number.isFinite(lastSeenAt) &&
    Math.abs(now - lastSeenAt) < ONLINE_GRACE_PERIOD_MS
  );
}

export function usePresenceClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return now;
}
