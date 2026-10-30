import "server-only";

import type { ReportPhoto } from "@streetproof/db";
import { createHash, randomUUID } from "node:crypto";

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
): Promise<ReadPhotosResult> {
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const problem = photoProblem(files);
  if (problem) return { ok: false, error: problem };

  const photos: ReadPhoto[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = detectPhotoFormat(bytes);
    if (!format) {
      return { ok: false, error: "Photos must be JPEG, PNG or WebP images." };
    }
    photos.push({
      bytes,
      contentType: format.contentType,
      extension: format.extension,
      sha256: createHash("sha256").update(bytes).digest("hex"),
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
