"use server";

import { transcribeWav } from "@streetproof/media/transcribe";
import { isWav } from "@streetproof/media/wav";
import { headers } from "next/headers";

import { createRateLimiter } from "@/lib/rate-limit";

export type VoiceNoteResult =
  { ok: true; text: string } | { ok: false; error: string };

// A minute of mono 16 kHz audio is about 2 MB, so this leaves room and no more.
const MAX_VOICE_NOTE_BYTES = 4 * 1024 * 1024;

const isVoiceNoteAllowed = createRateLimiter({
  limit: 10,
  windowMs: 10 * 60 * 1000,
});

const NOT_UNDERSTOOD =
  "We couldn't make that out. Please try again, or type it.";

export async function transcribeVoiceNote(
  formData: FormData,
): Promise<VoiceNoteResult> {
  const apiKey = process.env.META_API_KEY;
  if (!apiKey) return { ok: false, error: NOT_UNDERSTOOD };

  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isVoiceNoteAllowed(clientAddress)) {
    return {
      ok: false,
      error: "Too many voice notes from this device. Please type it instead.",
    };
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File) || audio.size > MAX_VOICE_NOTE_BYTES) {
    return { ok: false, error: NOT_UNDERSTOOD };
  }
  const bytes = new Uint8Array(await audio.arrayBuffer());
  if (!isWav(bytes)) return { ok: false, error: NOT_UNDERSTOOD };

  const text = await transcribeWav(bytes, {
    apiKey,
    baseUrl: process.env.META_API_BASE_URL || "https://api.meta.ai/v1",
  });
  return text ? { ok: true, text } : { ok: false, error: NOT_UNDERSTOOD };
}
