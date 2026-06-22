"use client";

import { useLayoutEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DisplayMessage } from "@/lib/chat-state";

type Props = {
  messages: DisplayMessage[];
  currentUserId: string;
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
};

export function MessageList({
  messages,
  currentUserId,
  hasOlder,
  loadingOlder,
  onLoadOlder,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 8,
    getItemKey: (index) => messages[index].id,
  });

  useLayoutEffect(() => {
    if (messages.length) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, virtualizer]);

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7"
    >
      {hasOlder ? (
        <div className="mb-4 text-center">
          <button
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="rounded-full border px-3 py-1.5 text-sm font-semibold"
          >
            {loadingOlder ? "Loading…" : "Load older messages"}
          </button>
        </div>
      ) : null}

      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const message = messages[row.index];
          const mine = message.senderId === currentUserId;
          const failed = "status" in message && message.status === "failed";
          const status =
            "status" in message
              ? message.status === "sending"
                ? "Sending"
                : "Failed"
              : message.reads.length
                ? "Read"
                : message.deliveredAt
                  ? "Delivered"
                  : "Sent";

          return (
            <article
              key={message.id}
              ref={virtualizer.measureElement}
              data-index={row.index}
              className={`absolute left-0 top-0 flex w-full pb-2 ${mine ? "justify-end" : "justify-start"}`}
              style={{ transform: `translateY(${row.start}px)` }}
              aria-label={`${mine ? "You" : message.sender.username} at ${new Date(message.createdAt).toLocaleTimeString()}`}
            >
              <div
                className={[
                  "max-w-[min(38rem,82%)] rounded-2xl px-3.5 py-2.5 shadow-sm",
                  mine
                    ? "rounded-br-md bg-ink-950 text-white"
                    : "rounded-bl-md bg-mist-100",
                  failed ? "ring-2 ring-red-500" : "",
                ].join(" ")}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[0.7rem] opacity-65">
                  <time dateTime={message.createdAt}>
                    {new Intl.DateTimeFormat(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(message.createdAt))}
                  </time>
                  {mine ? ` · ${status}` : ""}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
