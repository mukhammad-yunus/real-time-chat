"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { otherParticipant } from "@/lib/chat-state";
import { isUserOnline, usePresenceClock } from "@/lib/presence";
import { UserSearch } from "@/components/chat/user-search";
import type { Conversation, SessionUser } from "@/types/api";
import type { Route } from "next";

type Props = {
  currentUser: SessionUser;
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationAdded: (conversation: Conversation) => void;
};

export function ConversationSidebar({
  currentUser,
  conversations,
  activeConversationId,
  onConversationAdded,
}: Props) {
  const now = usePresenceClock();

  return (
    <aside
      className={[
        "min-h-0 border-r bg-mist-50/80",
        activeConversationId ? "hidden md:flex md:flex-col" : "flex flex-col",
      ].join(" ")}
      aria-label="Conversation navigation"
    >
      <header className="flex items-center justify-between border-b px-5 py-4">
        <Link
          href={"/chat" as Route}
          className="font-display text-2xl font-semibold"
        >
          Relay
        </Link>
        <form action={logoutAction}>
          <button className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-black/5">
            Sign out
          </button>
        </form>
      </header>

      <UserSearch onConversationAdded={onConversationAdded} />

      <nav
        className="min-h-0 flex-1 overflow-y-auto p-3"
        aria-label="Conversations"
      >
        {conversations.length ? (
          <ul className="space-y-1">
            {conversations.map((conversation) => {
              const other = otherParticipant(conversation, currentUser.id);
              const online = other ? isUserOnline(other, now) : false;
              const latest = conversation.messages?.[0];
              const active = conversation.id === activeConversationId;

              return (
                <li key={conversation.id}>
                  <Link
                    href={`/chat/${conversation.id}` as Route}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "grid grid-cols-[2.75rem_1fr] gap-3 rounded-2xl p-3 transition",
                      active ? "bg-white shadow-sm" : "hover:bg-white/70",
                    ].join(" ")}
                  >
                    <span className="relative grid h-11 w-11 place-items-center rounded-full bg-mist-100 font-semibold">
                      {other?.username.slice(0, 1).toUpperCase()}
                      <span
                        className={[
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                          online ? "bg-mint-500" : "bg-slate-300",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">
                          @{other?.username}
                        </span>
                        <span className="sr-only">
                          {online ? "Online" : "Offline"}
                        </span>
                      </span>
                      <span className="block truncate text-sm text-ink-700">
                        {latest?.content ?? "Start the conversation"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <MessageCircle aria-hidden="true" className="text-mint-600" />
            <p className="mt-3 font-semibold">No conversations yet</p>
            <p className="mt-1 text-sm text-ink-700">
              Search for a username to begin.
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
}
