import { describe, expect, it } from "vitest";

import { encodeWav, isWav } from "./wav";

describe("encodeWav", () => {
  it("writes mono 16-bit WAV at the asked rate", () => {
    const bytes = encodeWav(new Float32Array([0, 0.5, -0.5]), 16000);
    const view = new DataView(bytes.buffer, bytes.byteOffset);

    expect(isWav(bytes)).toBe(true);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);
  });

  it("keeps loud samples in range instead of wrapping around", () => {
    const bytes = encodeWav(new Float32Array([2, -2]), 16000);
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const dataStart = bytes.length - 4;

    expect(view.getInt16(dataStart, true)).toBeGreaterThan(32000);
    expect(view.getInt16(dataStart + 2, true)).toBeLessThan(-32000);
  });

  it("resamples down to the rate Meta wants", () => {
    const second = new Float32Array(48_000);
    const bytes = encodeWav(second, 48_000, 16_000);
    const view = new DataView(bytes.buffer, bytes.byteOffset);

    expect(view.getUint32(24, true)).toBe(16_000);
    // One second of 16-bit samples, give or take the header.
    expect(bytes.length).toBeGreaterThan(31_000);
    expect(bytes.length).toBeLessThan(33_000);
  });
});

describe("isWav", () => {
  it("refuses anything that isn't", () => {
    expect(isWav(new TextEncoder().encode("<script>alert(1)</script>"))).toBe(
      false,
    );
    expect(isWav(new Uint8Array())).toBe(false);
  });
});
