"use server";

import { getDb, recordAudit } from "@streetproof/db";
import { isAPIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getAuth } from "@/lib/auth";
import { requireMember } from "@/lib/member";
import { createRateLimiter } from "@/lib/rate-limit";

export type AccountState = { error: string | null; isDone: boolean };

const nameFields = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(100, "Keep the name under 100 characters."),
});

const passwordFields = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Keep the password under 128 characters."),
    repeatPassword: z.string(),
  })
  .refine((fields) => fields.newPassword === fields.repeatPassword, {
    message: "The new passwords don't match.",
  });

const isPasswordChangeAllowed = createRateLimiter({
  name: "password-change",
  limit: 10,
  windowMs: 10 * 60 * 1000,
});

export async function updateNameAction(
  _previous: AccountState,
  formData: FormData,
): Promise<AccountState> {
  await requireMember();
  const fields = nameFields.safeParse({ name: formData.get("name") ?? "" });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? null, isDone: false };
  }
  await getAuth().api.updateUser({
    body: { name: fields.data.name },
    headers: await headers(),
  });
  revalidatePath("/[lang]/app", "layout");
  return { error: null, isDone: true };
}

// Better Auth checks the current password, so a session left open on a shared
// computer can't be used to lock its owner out. Other sessions end.
export async function changePasswordAction(
  _previous: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const member = await requireMember();
  if (!(await isPasswordChangeAllowed(member.userId))) {
    return {
      error: "Too many tries. Try again in a while.",
      isDone: false,
    };
  }
  const fields = passwordFields.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    repeatPassword: formData.get("repeatPassword") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? null, isDone: false };
  }

  const requestHeaders = await headers();
  try {
    await getAuth().api.changePassword({
      body: {
        currentPassword: fields.data.currentPassword,
        newPassword: fields.data.newPassword,
      },
      headers: requestHeaders,
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error: "Your current password isn't right.",
        isDone: false,
      };
    }
    throw error;
  }
  // Ends every other session and keeps this one. Asking changePassword to do it
  // swaps this session's token, and a server action can't hand the new cookie back.
  await getAuth().api.revokeOtherSessions({ headers: requestHeaders });

  await recordAudit(getDb(), {
    tenantId: member.tenantId,
    actorId: member.userId,
    action: "account.password_changed",
    targetType: "user",
    targetId: member.userId,
  });
  return { error: null, isDone: true };
}
