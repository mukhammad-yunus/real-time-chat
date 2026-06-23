"use client";

import { Send } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { ChatSocket } from "@/lib/socket";

type Props = {
  conversationId: string;
  socket: ChatSocket;
  onSend: (content: string) => void;
};

export function MessageComposer({ conversationId, socket, onSend }: Props) {
  const [content, setContent] = useState("");
  const stopTimer = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function announceTyping() {
    socket.emit("typing:start", { conversationId });
    if (stopTimer.current) window.clearTimeout(stopTimer.current);
    stopTimer.current = window.setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 900);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = content.trim();
    if (!value || value.length > 2000) return;

    onSend(value);
    setContent("");
    socket.emit("typing:stop", { conversationId });
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  useEffect(() => {
    return () => {
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
      socket.emit("typing:stop", { conversationId });
    };
  }, [conversationId, socket]);

  return (
    <form onSubmit={submit} className="border-t bg-white p-3 sm:p-4">
      <label htmlFor="message" className="sr-only">
        Message
      </label>
      <div className="flex items-end gap-2 rounded-2xl border bg-mist-50 p-2">
        <textarea
          ref={textareaRef}
          id="message"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            announceTyping();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Write a message"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base outline-none sm:text-sm"
        />
        <button
          disabled={!content.trim()}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-600 text-white disabled:opacity-40"
        >
          <Send aria-hidden="true" size={18} />
        </button>
      </div>
      <p className="mt-1.5 px-2 text-xs text-ink-700">
        Enter sends · Shift+Enter adds a line
      </p>
    </form>
  );
}
