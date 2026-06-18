import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">Page not found</h1>

        <p className="mt-3 text-ink-700">
          The page you requested could not be found.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-ink-950 px-4 py-2.5 font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
