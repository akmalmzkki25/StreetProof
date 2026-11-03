import { isWav } from "@streetproof/media/wav";
import { describe, expect, it } from "vitest";

import { oggToWav, transcribeOgg } from "./voice";

// A quarter of a second of a 440 Hz tone, encoded the way Telegram sends voice notes.
const TONE_OGG = Buffer.from(
  "T2dnUwACAAAAAAAAAACd6mi6AAAAAGq//FYBE09wdXNIZWFkAQE4AYC7AAAAAABPZ2dTAAAAAAAAAAAAAJ3qaLoBAAAASLWqsQE9T3B1c1RhZ3MMAAAATGF2ZjYyLjMuMTAwAQAAAB0AAABlbmNvZGVyPUxhdmM2Mi4xMS4xMDAgbGlib3B1c09nZ1MABBgwAAAAAAAAnepougIAAABhtqvkDUUqMzw5NzQ3NCkuLi14ggG3bH5A5gAACr6ap77/toXXCnHg3Wug48bFwzLGZB5uY1I6RQyKU49EGLCMZKvsmJZ5bFRTMFVOguQWyllJ2McJXVl4oz/3rJiFA1dMArJzAWNy7uj6hhOaw2wtDonfTZ/89r2Bz4Jz/RFWo0d4m6MSUUUArNJTaaTC6h5Wy9NCCE/Wl23jKUJPRqMTnValrkQKoRlEAkOCEVf9nBm1CId4m6MRtBy/qJsbyUPSGy+v4iH91Lsxx3P6VYPkAqesTgzglsm4hHZhGOIUMkATzk4zYZ98ik+QyIChX5Z4m6NfdZz8RZ5abl6z34p0Xwxr2jXFeN5Te8aDyDhB9iE5sM5/dEQK8N8PRLyQr0SBEMtn47IG4vp4m6MXUV8bHDuWy8PIenIQ7jZkItmyLKgmkA76Lbvi3NgurZdMuMHsn18K5fqrL0AIWzgvQoVjeJujX3Wc/Ekyq3wc9F9bv0JKQ80WM2uQ0mzch4Hx2Nnhhw1PXlmxh7rSo/JS2ety6sq+hniboxJTqkh94QP00CjwnBvYodQu4+gSYJNSIqV7tTv+FfHiVtTzyVMQ90XDyMRPZHZ3vLOK/AZ4m6MSVs4iKkUE7QfwgaLj7MIEkV+3BI34FFdiGKIir6xSE0kJenPLDpsEjLU4dHtooV+WSJujX3Wc/EWecn9+6eIYk0ozoYGfWH0wph/fP5nDVL7ZIG4hcpj59NRImyrSUUT987G+2fDjpOM3KSEcV3FUHU9QdD7iuxGBM62zxF3YIcAG+BJNQK/cSJsrH3Wc/ElKIvEXa6w8OkkSpXbAHUpsFMfLl4xw7TLdGLd8fM+gsmcEufvvgEibvBMlNWKre+YI/L/hr4cTJq6iKlypAgL0YKol3oafgWUYm4WZNZVEzXNzQA==",
  "base64",
);

const SAMPLE_RATE_OFFSET = 24;

describe("oggToWav", () => {
  it("turns a Telegram voice note into 16 kHz WAV", async () => {
    const wav = await oggToWav(new Uint8Array(TONE_OGG));

    expect(wav).not.toBeNull();
    expect(isWav(wav as Uint8Array)).toBe(true);
    const view = new DataView((wav as Uint8Array).buffer);
    expect(view.getUint32(SAMPLE_RATE_OFFSET, true)).toBe(16_000);
    // A quarter of a second, in 16-bit samples, give or take the codec's padding.
    expect((wav as Uint8Array).length).toBeGreaterThan(7000);
    expect((wav as Uint8Array).length).toBeLessThan(10_000);
  });
});

describe("transcribeOgg", () => {
  it("sends WAV to the model and returns the text", async () => {
    const seen: string[] = [];
    const text = await transcribeOgg(new Uint8Array(TONE_OGG), {
      apiKey: "test",
      baseUrl: "https://model.example.test",
      fetchImpl: async (url) => {
        seen.push(String(url));
        return Response.json({ transcript: "air bocor" });
      },
    });

    expect(text).toBe("air bocor");
    expect(seen).toEqual(["https://model.example.test/asr/transcribe"]);
  });

  it("returns null for bytes that aren't audio", async () => {
    let wasCalled = false;
    const text = await transcribeOgg(new TextEncoder().encode("not audio"), {
      apiKey: "test",
      baseUrl: "https://model.example.test",
      fetchImpl: async () => {
        wasCalled = true;
        return Response.json({ transcript: "never" });
      },
    });

    expect(text).toBeNull();
    expect(wasCalled).toBe(false);
  });
});
