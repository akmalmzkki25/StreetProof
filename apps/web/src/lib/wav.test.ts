import { describe, expect, it } from "vitest";

import { encodeWav, isWav } from "./wav";

describe("encodeWav", () => {
  it("writes a header a WAV reader can trust", () => {
    const bytes = encodeWav(new Float32Array([0, 0.5, -0.5]), 16000);
    const view = new DataView(bytes.buffer);

    expect(isWav(bytes)).toBe(true);
    expect(bytes.length).toBe(44 + 6);
    expect(view.getUint32(4, true)).toBe(36 + 6);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(6);
  });

  it("clamps samples instead of wrapping around", () => {
    const view = new DataView(
      encodeWav(new Float32Array([2, -2]), 16000).buffer,
    );

    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32767);
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
