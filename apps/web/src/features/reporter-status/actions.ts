"use server";

import { answerClarification, getDb, getReporterStatus } from "@streetproof/db";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { createRateLimiter } from "@/lib/rate-limit";

import { REPORTER_COOKIE } from "./cookie";

const RECEIPT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export type AnswerState = { error: string | null };

const answerFields = z.object({
  clarificationId: z.uuid(),
  answer: z
    .string()
    .trim()
    .min(2, "Write your answer first.")
    .max(2000, "Keep your answer under 2,000 characters."),
});

const isAnswerAllowed = createRateLimiter({
  limit: 10,
  windowMs: 10 * 60 * 1000,
});

export async function answerClarificationAction(
  _previous: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isAnswerAllowed(clientAddress)) {
    return { error: "Too many tries from this device. Try again in a while." };
  }

  const fields = answerFields.safeParse({
    clarificationId: formData.get("clarificationId"),
    answer: formData.get("answer") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check your answer." };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(REPORTER_COOKIE)?.value;
  const outcome = token
    ? await answerClarification(getDb(), { token, ...fields.data })
    : ({ ok: false } as const);
  if (!outcome.ok) {
    return {
      error:
        "This question is no longer open. Reload the page to see the latest.",
    };
  }

  revalidatePath("/status");
  revalidatePath("/app/queue");
  revalidatePath(`/app/tickets/${outcome.ticketId}`);
  return { error: null };
}

// Moves the secret from the URL fragment into an HttpOnly cookie scoped to the
// status page, so it never reaches logs, referrers or client scripts again.
export async function exchangeReceipt(token: string) {
  // A bad link leaves any valid receipt already on this device in place.
  const status = await getReporterStatus(getDb(), token);
  if (!status) return;

  const cookieStore = await cookies();
  cookieStore.set(REPORTER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/status",
    maxAge: RECEIPT_COOKIE_MAX_AGE_SECONDS,
  });
}
