import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createRateLimiter, memoryStore } = await import("./rate-limit");

describe("createRateLimiter", () => {
  it("blocks a key over the limit, and counts keys apart", async () => {
    const isAllowed = createRateLimiter(
      { name: "test", limit: 2, windowMs: 60_000 },
      memoryStore,
    );

    expect(await isAllowed("a")).toBe(true);
    expect(await isAllowed("a")).toBe(true);
    expect(await isAllowed("a")).toBe(false);
    expect(await isAllowed("b")).toBe(true);
  });

  it("keeps two limiters on the same key apart", async () => {
    const reports = createRateLimiter(
      { name: "reports", limit: 1, windowMs: 60_000 },
      memoryStore,
    );
    const voice = createRateLimiter(
      { name: "voice", limit: 1, windowMs: 60_000 },
      memoryStore,
    );

    expect(await reports("same")).toBe(true);
    expect(await voice("same")).toBe(true);
    expect(await reports("same")).toBe(false);
  });
});
