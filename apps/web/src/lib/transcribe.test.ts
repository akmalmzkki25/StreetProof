import { describe, expect, it, vi } from "vitest";

import { transcribeWav, transcriptOf } from "./transcribe";

const wav = new Uint8Array([1, 2, 3]);

function answering(status: number, body: unknown) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
}

describe("transcribeWav", () => {
  it("sends the WAV and settings, and asks for Indonesian first", async () => {
    const fetchImpl = answering(200, { transcript: " Pipa bocor. " });

    const text = await transcribeWav(wav, {
      apiKey: "key",
      baseUrl: "https://api.example.test/v1",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(text).toBe("Pipa bocor.");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.example.test/v1/asr/transcribe");
    expect(init.headers).toMatchObject({ Authorization: "Bearer key" });
    const form = init.body as FormData;
    const settings = JSON.parse(
      await (form.get("request") as Blob).text(),
    ) as Record<string, unknown>;
    expect(settings).toMatchObject({
      audioEncoding: "WAV",
      languageBias: ["Indonesian", "English"],
    });
    expect((form.get("audio") as File).type).toBe("audio/wav");
  });

  it("gives null on a failed request or no speech, so the form carries on", async () => {
    const config = { apiKey: "key", baseUrl: "https://api.example.test/v1" };

    for (const fetchImpl of [
      answering(500, { error: {} }),
      answering(200, { transcript: "   " }),
      vi.fn(async () => {
        throw new Error("offline");
      }),
    ]) {
      expect(
        await transcribeWav(wav, {
          ...config,
          fetchImpl: fetchImpl as unknown as typeof fetch,
        }),
      ).toBeNull();
    }
  });
});

describe("transcriptOf", () => {
  it("joins turns when the text arrives split", () => {
    expect(
      transcriptOf({
        turns: [{ transcript: "Pipa" }, { transcript: "bocor" }],
      }),
    ).toBe("Pipa bocor");
  });
});
