"use client";

import { useEffect } from "react";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">The conversation went quiet.</h1>
        <p className="mt-3 text-ink-700">
          We could not load your messages. Your data has not been changed.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-ink-950 px-4 py-2.5 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
