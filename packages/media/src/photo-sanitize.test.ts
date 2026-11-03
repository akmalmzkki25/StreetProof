import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  MAX_PHOTO_EDGE,
  MAX_PHOTO_PIXELS,
  sanitizePhoto,
} from "./photo-sanitize";

function solid(width: number, height: number) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 90, b: 60 },
    },
  });
}

async function sanitized(input: Buffer) {
  const result = await sanitizePhoto(new Uint8Array(input));
  if (!result.ok) throw new Error(result.error);
  return result;
}

describe("sanitizePhoto", () => {
  it("removes EXIF, including GPS, from the stored bytes", async () => {
    const input = await solid(64, 64)
      .withExif({
        IFD0: { Make: "SyntheticPhone", Copyright: "Reporter name" },
        IFD3: { GPSLatitudeRef: "S", GPSLatitude: "6/1 10/1 0/1" },
      })
      .jpeg()
      .toBuffer();
    expect((await sharp(input).metadata()).exif).toBeDefined();
    expect(input.includes("SyntheticPhone")).toBe(true);

    const { bytes } = await sanitized(input);

    const metadata = await sharp(bytes).metadata();
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(Buffer.from(bytes).includes("SyntheticPhone")).toBe(false);
  });

  it("applies the EXIF orientation before dropping it", async () => {
    const input = await solid(100, 50)
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const { bytes } = await sanitized(input);

    const metadata = await sharp(bytes).metadata();
    expect([metadata.width, metadata.height]).toEqual([50, 100]);
    expect(metadata.orientation).toBeUndefined();
  });

  it("drops anything hidden after the image data", async () => {
    const image = await solid(64, 64).jpeg().toBuffer();
    const polyglot = Buffer.concat([
      image,
      Buffer.from("<script>alert('hidden')</script>"),
    ]);

    const { bytes } = await sanitized(polyglot);

    expect(Buffer.from(bytes).includes("<script>")).toBe(false);
  });

  it("stores every format as JPEG, flattening transparency", async () => {
    const input = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();

    const result = await sanitized(input);

    expect(result.contentType).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
    const metadata = await sharp(result.bytes).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.hasAlpha).toBe(false);
  });

  it("scales a large photo down and never scales a small one up", async () => {
    const large = await solid(4000, 1000).jpeg().toBuffer();
    const small = await solid(200, 100).jpeg().toBuffer();

    const scaled = await sharp((await sanitized(large)).bytes).metadata();
    const kept = await sharp((await sanitized(small)).bytes).metadata();

    expect([scaled.width, scaled.height]).toEqual([
      MAX_PHOTO_EDGE,
      MAX_PHOTO_EDGE / 4,
    ]);
    expect([kept.width, kept.height]).toEqual([200, 100]);
  });

  // Encoding the oversized PNG takes seconds when every package tests at once.
  it(
    "rejects a small file that decodes to too many pixels",
    {
      timeout: 30_000,
    },
    async () => {
      const side = Math.ceil(Math.sqrt(MAX_PHOTO_PIXELS)) + 1;
      const bomb = await solid(side, side).png().toBuffer();
      expect(bomb.length).toBeLessThan(10 * 1024 * 1024);

      const result = await sanitizePhoto(new Uint8Array(bomb));

      expect(result).toEqual({
        ok: false,
        error: "That photo is too large to process. Try a smaller one.",
      });
    },
  );

  it("rejects a file that only starts like an image", async () => {
    const fake = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from("#!/bin/sh\nrm -rf /\n"),
    ]);

    const result = await sanitizePhoto(new Uint8Array(fake));

    expect(result).toEqual({
      ok: false,
      error: "One of these photos can't be read. Try taking it again.",
    });
  });

  it("rejects a cut-off upload instead of storing a partial picture", async () => {
    const image = await solid(400, 400).jpeg().toBuffer();

    const result = await sanitizePhoto(
      new Uint8Array(image.subarray(0, Math.floor(image.length / 2))),
    );

    expect(result.ok).toBe(false);
  });

  it("gives the same bytes for the same input, so a retry matches", async () => {
    const input = await solid(64, 64).jpeg().toBuffer();

    const first = await sanitized(input);
    const second = await sanitized(input);

    expect(first.sha256).toBe(second.sha256);
    expect(first.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
