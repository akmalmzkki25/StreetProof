import type { Db, TelegramLocale } from "@streetproof/db";
import { sanitizePhoto } from "@streetproof/media/photo-sanitize";
import { detectPhotoFormat, MAX_PHOTO_BYTES } from "@streetproof/media/photos";
import type { Context } from "grammy";
import { createHash, randomUUID } from "node:crypto";

import { t, type MessageKey } from "./messages";

export type BotDeps = {
  db: Db;
  putObject: (
    key: string,
    body: Uint8Array,
    contentType: string,
  ) => Promise<void>;
  getObjectBytes: (key: string) => Promise<Uint8Array>;
  downloadFile: (filePath: string) => Promise<Uint8Array>;
  // Null when no Meta key is set.
  transcribe: ((ogg: Uint8Array) => Promise<string | null>) | null;
  appUrl: string;
};

export function chatIdOf(ctx: Context) {
  return String(ctx.chat?.id);
}

export function localeOf(ctx: Context): TelegramLocale {
  return ctx.from?.language_code?.startsWith("id") ? "id" : "en";
}

// Plain text with no markup, so nothing a person typed can be read as formatting,
// and no preview, so a status link isn't fetched by anyone.
export function say(ctx: Context, text: string) {
  return ctx.reply(text, { link_preview_options: { is_disabled: true } });
}

export function sayKey(
  ctx: Context,
  key: MessageKey,
  params?: Record<string, string | number>,
) {
  return say(ctx, t(localeOf(ctx), key, params));
}

// The largest size Telegram made of a photo, or an image sent as a file.
export function incomingPhoto(ctx: Context) {
  const sizes = ctx.message?.photo;
  if (sizes && sizes.length > 0) {
    const largest = sizes[sizes.length - 1];
    if (largest) return { fileId: largest.file_id, size: largest.file_size };
  }
  const document = ctx.message?.document;
  if (document) return { fileId: document.file_id, size: document.file_size };
  return null;
}

// The same checks as the web forms, one photo at a time, and stored before any
// ticket change so a failure leaves the ticket alone.
export async function receivePhoto(
  ctx: Context,
  deps: BotDeps,
  keyPrefix: string,
) {
  const photo = incomingPhoto(ctx);
  if (!photo) return null;
  if (photo.size !== undefined && photo.size > MAX_PHOTO_BYTES) {
    await sayKey(ctx, "photoTooBig");
    return null;
  }

  const file = await ctx.api.getFile(photo.fileId);
  if (!file.file_path) {
    await sayKey(ctx, "photoUnreadable");
    return null;
  }
  const bytes = await deps.downloadFile(file.file_path);
  if (bytes.length > MAX_PHOTO_BYTES) {
    await sayKey(ctx, "photoTooBig");
    return null;
  }
  if (!detectPhotoFormat(bytes)) {
    await sayKey(ctx, "photoNotImage");
    return null;
  }
  const sanitized = await sanitizePhoto(bytes);
  if (!sanitized.ok) {
    await sayKey(ctx, "photoUnreadable");
    return null;
  }

  const objectKey = `${keyPrefix}/${randomUUID()}.${sanitized.extension}`;
  try {
    await deps.putObject(objectKey, sanitized.bytes, sanitized.contentType);
  } catch {
    await sayKey(ctx, "photoSaveFailed");
    return null;
  }
  return {
    objectKey,
    contentType: sanitized.contentType,
    bytes: sanitized.bytes.length,
    sha256: sanitized.sha256,
  };
}

export function digestOf(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

// In memory, so limits are per process, and there's only ever one poller per token.
export function createRateLimiter(limit: number, windowMs: number) {
  const windows = new Map<string, { startedAt: number; count: number }>();
  return function isAllowed(key: string, now = Date.now()) {
    const current = windows.get(key);
    if (!current || now - current.startedAt >= windowMs) {
      windows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  };
}
