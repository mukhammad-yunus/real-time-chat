export default function ChatLoading() {
  return (
    <main className="grid min-h-dvh grid-cols-1 bg-white md:grid-cols-[22rem_1fr]">
      <aside className="hidden border-r p-5 md:block">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-mist-100" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-mist-100"
            />
          ))}
        </div>
      </aside>
      <section
        className="grid place-items-center"
        aria-label="Loading conversation"
      >
        <div className="h-10 w-48 animate-pulse rounded-xl bg-mist-100" />
      </section>
    </main>
  );
}
