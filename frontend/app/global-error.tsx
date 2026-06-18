"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center p-6">
        <main className="text-center">
          <h1 className="text-2xl font-semibold">Relay could not start.</h1>
          <button
            onClick={reset}
            className="mt-5 rounded-xl bg-black px-4 py-2 text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
