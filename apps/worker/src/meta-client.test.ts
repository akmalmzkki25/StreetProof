import { afterEach, describe, expect, it, vi } from "vitest";

import {
  classifyHttpFailure,
  createMetaClient,
  ModelCallError,
} from "./meta-client";

const request = {
  instructions: "Rules",
  text: "Report",
  images: [{ contentType: "image/png", base64: "AAAA" }],
  jsonSchema: { type: "object" },
  schemaName: "intake_draft",
  safetyIdentifier: "hash",
};

const client = createMetaClient({
  apiKey: "test-key",
  baseUrl: "https://example.test/v1",
  model: "muse-spark-1.3",
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("classifyHttpFailure", () => {
  it.each([
    [429, null, "retryable"],
    [500, null, "retryable"],
    [503, "service_overloaded", "retryable"],
    [504, "gateway_timeout", "retryable"],
    [401, "invalid_api_key", "auth"],
    [402, "billing_not_configured", "auth"],
    [403, null, "auth"],
    [400, "content_policy_violation", "terminal"],
    [400, null, "terminal"],
    [404, null, "terminal"],
  ])("treats %i %s as %s", (status, code, expected) => {
    expect(classifyHttpFailure(status, code)).toBe(expected);
  });
});

describe("createMetaClient", () => {
  it("sends images inline with store off and reads the output text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            { type: "reasoning" },
            {
              type: "message",
              content: [{ type: "output_text", text: '{"ok":true}' }],
            },
          ],
          usage: { input_tokens: 5 },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await client(request);

    expect(response.outputText).toBe('{"ok":true}');
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body.store).toBe(false);
    expect(body.text.format.strict).toBe(true);
    expect(body.input[0].content[1].image_url).toBe(
      "data:image/png;base64,AAAA",
    );
  });

  it("reports the Retry-After wait on a rate limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: { code: "rate_limit_exceeded" } }),
            { status: 429, headers: { "retry-after": "7" } },
          ),
        ),
    );

    const error = await client(request).catch((caught) => caught);

    expect(error).toBeInstanceOf(ModelCallError);
    expect(error).toMatchObject({
      failureClass: "retryable",
      errorClass: "rate_limit_exceeded",
      retryAfterMs: 7000,
    });
  });

  it("doesn't choke on a 404 with an empty body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 404 })),
    );

    await expect(client(request)).rejects.toMatchObject({
      failureClass: "terminal",
      errorClass: "http_404",
    });
  });

  it("treats a network failure as retryable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(client(request)).rejects.toMatchObject({
      failureClass: "retryable",
      errorClass: "network_or_timeout",
    });
  });
});
