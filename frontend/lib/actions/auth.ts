"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/server/backend";

export async function logoutAction() {
  try {
    await backendFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete("rtc_auth");
  }

  redirect("/login");
}
