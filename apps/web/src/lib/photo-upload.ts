import "server-only";

import type { ReportPhoto } from "@streetproof/db";
import { randomUUID } from "node:crypto";

import { sanitizePhoto } from "./photo-sanitize";
import { detectPhotoFormat, photoProblem } from "./photos";
import { getStorage } from "./storage";

type ReadPhoto = {
  bytes: Uint8Array;
  contentType: string;
  extension: string;
  sha256: string;
};

export type ReadPhotosResult =
  { ok: true; photos: ReadPhoto[] } | { ok: false; error: string };

export async function readPhotos(
  formData: FormData,
  options: { optional?: boolean } = {},
): Promise<ReadPhotosResult> {
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0 && options.optional) return { ok: true, photos: [] };
  const problem = photoProblem(files);
  if (problem) return { ok: false, error: problem };

  const photos: ReadPhoto[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!detectPhotoFormat(bytes)) {
      return { ok: false, error: "Photos must be JPEG, PNG or WebP images." };
    }
    const sanitized = await sanitizePhoto(bytes);
    if (!sanitized.ok) return { ok: false, error: sanitized.error };
    photos.push({
      bytes: sanitized.bytes,
      contentType: sanitized.contentType,
      extension: sanitized.extension,
      sha256: sanitized.sha256,
    });
  }
  return { ok: true, photos };
}

// Runs before the database transaction, so a failure here leaves no ticket
// change behind. A failure after it leaves an unreferenced object to clean up.
export async function storePhotos(
  photos: readonly ReadPhoto[],
  keyPrefix: string,
): Promise<ReportPhoto[]> {
  const storage = getStorage();
  const stored: ReportPhoto[] = [];
  for (const photo of photos) {
    const objectKey = `${keyPrefix}/${randomUUID()}.${photo.extension}`;
    await storage.putObject(objectKey, photo.bytes, photo.contentType);
    stored.push({
      objectKey,
      contentType: photo.contentType,
      bytes: photo.bytes.length,
      sha256: photo.sha256,
    });
  }
  return stored;
}
