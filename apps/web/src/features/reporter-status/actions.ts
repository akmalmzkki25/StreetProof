"use server";

import {
  answerClarification,
  errorFields,
  getDb,
  getReporterStatus,
  issueRecoveryLinks,
  logEvent,
} from "@streetproof/db";
import { createMailer, recoveryMail } from "@streetproof/db/mail";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import { localePath, LOCALES } from "@/lib/i18n/translate";
import { createRateLimiter } from "@/lib/rate-limit";

import { readReceipt, receiptCookieName } from "./cookie";

const RECEIPT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export type AnswerState = { error: string | null };

export type RecoverState = { isSent: boolean; error: string | null };

const isRecoveryAllowed = createRateLimiter({
  name: "status-recovery",
  limit: 5,
  windowMs: 10 * 60 * 1000,
});

async function sendRecoveryLinks(email: string) {
  const sendMail = createMailer();
  if (!sendMail) return;
  try {
    const links = await issueRecoveryLinks(getDb(), email);
    if (links.length === 0) return;
    await sendMail(
      recoveryMail({ to: email, links, appUrl: process.env.APP_URL ?? "" }),
    );
  } catch (error) {
    logEvent("error", "Status link recovery failed", errorFields(error));
  }
}

// The same answer, at the same speed, whether or not the address is known. Sending
// after the response keeps timing from giving that away.
export async function recoverLinksAction(
  _previous: RecoverState,
  formData: FormData,
): Promise<RecoverState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) {
    return { isSent: false, error: "Enter your email address." };
  }

  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!(await isRecoveryAllowed(clientAddress))) {
    return {
      isSent: false,
      error: "Too many tries from this device. Try again in a while.",
    };
  }

  after(() => sendRecoveryLinks(email.data));
  return { isSent: true, error: null };
}

const answerFields = z.object({
  clarificationId: z.uuid(),
  answer: z
    .string()
    .trim()
    .min(2, "Write your answer first.")
    .max(2000, "Keep your answer under 2,000 characters."),
});

const isAnswerAllowed = createRateLimiter({
  name: "status-answer",
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
  if (!(await isAnswerAllowed(clientAddress))) {
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
  const token = readReceipt(cookieStore);
  const outcome = token
    ? await answerClarification(getDb(), { token, ...fields.data })
    : ({ ok: false } as const);
  if (!outcome.ok) {
    return {
      error:
        "This question is no longer open. Reload the page to see the latest.",
    };
  }

  revalidatePath("/[lang]/status", "page");
  revalidatePath("/[lang]/app/queue", "page");
  revalidatePath("/[lang]/app/tickets/[id]", "page");
  return { error: null };
}

// Moves the secret from the URL fragment into an HttpOnly cookie scoped to the
// status page, so it never reaches logs, referrers or client scripts again.
export async function exchangeReceipt(token: string) {
  // A bad link leaves any valid receipt already on this device in place.
  const status = await getReporterStatus(getDb(), token);
  if (!status) return;

  const cookieStore = await cookies();
  for (const locale of LOCALES) {
    cookieStore.set(receiptCookieName(locale), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: localePath(locale, "/status"),
      maxAge: RECEIPT_COOKIE_MAX_AGE_SECONDS,
    });
  }
}
