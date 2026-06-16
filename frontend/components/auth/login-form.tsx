"use client";

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { Field } from "@/components/ui/field";
import { unwrap } from "@/lib/api-error";
import type { SessionUser } from "@/types/api";
import type { Route } from "next";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.get("identifier"),
          password: form.get("password"),
        }),
      });

      await unwrap<{ user: SessionUser }>(response);
      router.replace("/chat" as Route);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field
        label="Username or email"
        name="identifier"
        autoComplete="username"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="min-h-11 w-full rounded-xl bg-ink-950 px-4 font-semibold text-white transition hover:bg-ink-700 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
