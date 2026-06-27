import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between" aria-label="Primary">
        <span className="font-display text-2xl font-semibold">Relay</span>
        <Link
          href="/login"
          className="rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </nav>
      <section className="grid flex-1 place-items-center py-20 text-center">
        <div className="max-w-3xl">
          <p className="font-semibold text-mint-600">Private by design</p>
          <h1 className="mt-4 text-balance font-display text-6xl leading-none sm:text-7xl">
            A quieter place to keep in touch.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink-700">
            One-to-one conversation, live presence, and durable history.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-block rounded-xl bg-mint-600 px-5 py-3 font-semibold text-white"
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}
