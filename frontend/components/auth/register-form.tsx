"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/field";
import { unwrap } from "@/lib/api-error";
import type { SessionUser } from "@/types/api";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/backend/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      await unwrap<{ user: SessionUser }>(response);

      router.replace("/login");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Registration failed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field
        label="Username"
        name="username"
        autoComplete="username"
        minLength={3}
        maxLength={20}
        required
      />

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="Use upper- and lowercase letters, a number, and a symbol."
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
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
