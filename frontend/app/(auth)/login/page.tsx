import type { Metadata, Route } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border bg-white/90 p-7 shadow-xl shadow-black/5 sm:p-9">
      <p className="text-sm font-semibold text-mint-600">Welcome back</p>
      <h1 className="mt-2 font-display text-4xl">Sign in to Relay</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-ink-700">
        New here?{" "}
        <Link
          href={"/register" as Route}
          className="font-semibold underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
