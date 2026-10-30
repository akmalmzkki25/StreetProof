export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

type PhotoFormat = { contentType: string; extension: string };

// Trust the bytes, not the filename or the browser's claimed type.
export function detectPhotoFormat(bytes: Uint8Array): PhotoFormat | null {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpeg) return { contentType: "image/jpeg", extension: "jpg" };

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = pngSignature.every((value, index) => bytes[index] === value);
  if (isPng) return { contentType: "image/png", extension: "png" };

  const ascii = new TextDecoder("ascii").decode(bytes.slice(0, 12));
  if (ascii.startsWith("RIFF") && ascii.endsWith("WEBP")) {
    return { contentType: "image/webp", extension: "webp" };
  }

  return null;
}

export function photoProblem(files: readonly { size: number }[]) {
  if (files.length === 0) return "Add at least one photo of the damage.";
  if (files.length > MAX_PHOTOS) return `Add at most ${MAX_PHOTOS} photos.`;
  if (files.some((file) => file.size > MAX_PHOTO_BYTES)) {
    return "Each photo must be 10 MB or smaller.";
  }
  return null;
}
