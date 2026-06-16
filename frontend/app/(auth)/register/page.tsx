import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border bg-white/90 p-7 shadow-xl shadow-black/5 sm:p-9">
      <p className="text-sm font-semibold text-mint-600">Join Relay</p>

      <h1 className="mt-2 font-display text-4xl">Create your account</h1>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-ink-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
