"use client";

import { Search } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
import {
  createConversationAction,
  type CreateConversationState,
} from "@/lib/actions/conversations";
import { unwrap } from "@/lib/api-error";
import type { Conversation, PublicUser } from "@/types/api";

const initialState: CreateConversationState = { status: "idle" };

export function UserSearch({
  onConversationAdded,
}: {
  onConversationAdded: (conversation: Conversation) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [state, formAction, pending] = useActionState(
    createConversationAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") onConversationAdded(state.conversation);
  }, [state, onConversationAdded]);

  useEffect(() => {
    if (query.trim().length < 1) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/backend/api/users/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        );
        const data = await unwrap<{ users: PublicUser[] }>(response);
        setResults(data.users);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <section className="border-b p-3" aria-labelledby={`${listId}-label`}>
      <label
        id={`${listId}-label`}
        htmlFor={`${listId}-input`}
        className="sr-only"
      >
        Search users
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700"
        />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a username"
          aria-controls={listId}
          className="min-h-11 w-full rounded-xl border bg-white pl-9 pr-3 text-base sm:text-sm"
        />
      </div>

      {query.trim().length > 0 && results.length ? (
        <ul
          id={listId}
          className="mt-2 rounded-xl border bg-white p-1 shadow-lg"
        >
          {results.map((user) => (
            <li key={user.id}>
              <form action={formAction}>
                <input type="hidden" name="participantId" value={user.id} />
                <button
                  disabled={pending}
                  className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left hover:bg-mist-50"
                >
                  <span className="font-semibold">@{user.username}</span>
                  <span className="text-xs text-ink-700">
                    {user.isOnline ? "Online" : "Offline"}
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      {state.status === "error" ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
