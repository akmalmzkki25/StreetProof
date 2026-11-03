import { createHash } from "node:crypto";
import sharp from "sharp";

// Far above any phone camera in normal use, and checked from the file header
// before decoding, so a tiny file can't claim billions of pixels and exhaust memory.
export const MAX_PHOTO_PIXELS = 64_000_000;
export const MAX_PHOTO_EDGE = 2048;

const DECODE_TIMEOUT_SECONDS = 20;
const JPEG_QUALITY = 85;

export type SanitizedPhoto = {
  ok: true;
  bytes: Uint8Array;
  contentType: "image/jpeg";
  extension: "jpg";
  sha256: string;
};

export type SanitizeResult = SanitizedPhoto | { ok: false; error: string };

// Every photo is decoded and written again, so only pixels survive: no EXIF or
// GPS, and nothing a sender hid in or after the image. Everyone who reads a photo
// afterward, the worker and Meta's model included, gets these bytes.
export async function sanitizePhoto(
  bytes: Uint8Array,
): Promise<SanitizeResult> {
  try {
    const output = await sharp(bytes, {
      limitInputPixels: MAX_PHOTO_PIXELS,
      failOn: "error",
    })
      .timeout({ seconds: DECODE_TIMEOUT_SECONDS })
      .rotate()
      .resize({
        width: MAX_PHOTO_EDGE,
        height: MAX_PHOTO_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    return {
      ok: true,
      bytes: new Uint8Array(output),
      contentType: "image/jpeg",
      extension: "jpg",
      sha256: createHash("sha256").update(output).digest("hex"),
    };
  } catch (error) {
    const isTooLarge =
      error instanceof Error && error.message.includes("pixel limit");
    return {
      ok: false,
      error: isTooLarge
        ? "That photo is too large to process. Try a smaller one."
        : "One of these photos can't be read. Try taking it again.",
    };
  }
}
