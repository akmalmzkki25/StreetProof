"use server";

import {
  createMemberLinkCode,
  createReportLinkCode,
  getDb,
} from "@streetproof/db";
import { cookies, headers } from "next/headers";

import { readReceipt } from "@/features/reporter-status/cookie";
import { requireMember } from "@/lib/member";
import { createRateLimiter } from "@/lib/rate-limit";
import { telegramUrl } from "@/lib/telegram";

export type TelegramLinkResult = { url: string | null };

const isFollowAllowed = createRateLimiter({
  limit: 10,
  windowMs: 10 * 60 * 1000,
});

export async function connectTelegramAction(): Promise<TelegramLinkResult> {
  const member = await requireMember();
  const code = await createMemberLinkCode(getDb(), {
    userId: member.userId,
    tenantId: member.tenantId,
  });
  return { url: telegramUrl(`l_${code}`) };
}

export async function followOnTelegramAction(): Promise<TelegramLinkResult> {
  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isFollowAllowed(clientAddress)) return { url: null };

  const token = readReceipt(await cookies());
  if (!token) return { url: null };
  const code = await createReportLinkCode(getDb(), token);
  return { url: code ? telegramUrl(`l_${code}`) : null };
}
