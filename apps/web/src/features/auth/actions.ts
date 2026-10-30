"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";

export type SignInState = { error: string | null; email: string };

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  try {
    await getAuth().api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error: "That email and password don't match an account.",
        email,
      };
    }
    throw error;
  }

  redirect("/app");
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/login");
}
