import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import type { Route } from "next";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (user) redirect("/chat" as Route);

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-black/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <p className="font-display text-4xl leading-tight">
          Conversation should feel close,
          <br />
          even when people are not.
        </p>
        <p className="max-w-md text-sm leading-6 text-ink-700">
          Relay is a private one-to-one messenger built around durable history,
          live presence, and quiet interface decisions.
        </p>
      </section>
      <section className="grid place-items-center p-6 sm:p-10">
        {children}
      </section>
    </main>
  );
}
