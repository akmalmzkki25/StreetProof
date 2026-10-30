import { describe, expect, it } from "vitest";

import { detectPhotoFormat, MAX_PHOTO_BYTES, photoProblem } from "./photos";

describe("detectPhotoFormat", () => {
  it("recognizes JPEG, PNG and WebP by their bytes", () => {
    expect(detectPhotoFormat(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toEqual(
      { contentType: "image/jpeg", extension: "jpg" },
    );
    expect(
      detectPhotoFormat(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )?.contentType,
    ).toBe("image/png");
    expect(
      detectPhotoFormat(new TextEncoder().encode("RIFF1234WEBPVP8 "))
        ?.contentType,
    ).toBe("image/webp");
  });

  it("rejects other content even with an image filename", () => {
    expect(
      detectPhotoFormat(new TextEncoder().encode("<script>alert(1)</script>")),
    ).toBeNull();
    expect(detectPhotoFormat(new Uint8Array())).toBeNull();
  });
});

describe("photoProblem", () => {
  it("requires between one and three photos", () => {
    expect(photoProblem([])).toMatch(/at least one/);
    expect(photoProblem([{ size: 1 }])).toBeNull();
    expect(
      photoProblem([{ size: 1 }, { size: 1 }, { size: 1 }, { size: 1 }]),
    ).toMatch(/at most 3/);
  });

  it("rejects a photo over the size limit", () => {
    expect(photoProblem([{ size: MAX_PHOTO_BYTES + 1 }])).toMatch(/10 MB/);
  });
});
