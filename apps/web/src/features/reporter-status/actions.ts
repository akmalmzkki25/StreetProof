"use server";

import { getDb, getReporterStatus } from "@streetproof/db";
import { cookies } from "next/headers";

import { REPORTER_COOKIE } from "./cookie";

const RECEIPT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

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
