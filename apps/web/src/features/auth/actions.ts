"use server";

import { findMemberByEmail, getDb, recordAudit } from "@streetproof/db";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuth } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";

export type SignInState = { error: string | null; email: string };

export type ResetRequestState = { isSent: boolean; error: string | null };

export type NewPasswordState = { isDone: boolean; error: string | null };

const isResetRequestAllowed = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
});

const newPasswordFields = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Keep the password under 128 characters."),
});

async function auditSignIn(email: string, action: string) {
  const db = getDb();
  const member = await findMemberByEmail(db, email);
  if (!member) return;
  await recordAudit(db, {
    tenantId: member.tenantId,
    actorId: member.userId,
    action,
  });
}

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const requestHeaders = await headers();
  try {
    await getAuth().api.signInEmail({
      body: { email, password },
      headers: requestHeaders,
    });
  } catch (error) {
    if (isAPIError(error)) {
      await auditSignIn(email, "auth.sign_in_failed");
      return {
        error: "That email and password don't match an account.",
        email,
      };
    }
    throw error;
  }

  await auditSignIn(email, "auth.signed_in");
  redirect("/app");
}

export async function signOut() {
  const requestHeaders = await headers();
  await getAuth().api.signOut({ headers: requestHeaders });
  redirect("/login");
}

// Always the same answer, so this can't be used to find out who has an account.
export async function requestPasswordReset(
  _previous: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) {
    return { isSent: false, error: "Enter your email address." };
  }

  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isResetRequestAllowed(clientAddress)) {
    return {
      isSent: false,
      error: "Too many tries from this device. Try again in a while.",
    };
  }

  await getAuth().api.requestPasswordReset({
    body: { email: email.data, redirectTo: "/reset-password" },
    headers: requestHeaders,
  });
  return { isSent: true, error: null };
}

export async function setNewPassword(
  _previous: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const fields = newPasswordFields.safeParse({
    token: formData.get("token") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!fields.success) {
    return {
      isDone: false,
      error: fields.error.issues[0]?.message ?? "Check the form.",
    };
  }

  try {
    await getAuth().api.resetPassword({
      body: { token: fields.data.token, newPassword: fields.data.password },
      headers: await headers(),
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        isDone: false,
        error: "This link has expired or was already used. Ask for a new one.",
      };
    }
    throw error;
  }
  return { isDone: true, error: null };
}
