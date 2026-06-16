import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import type { Route } from "next";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login" as Route);

  return children;
}
