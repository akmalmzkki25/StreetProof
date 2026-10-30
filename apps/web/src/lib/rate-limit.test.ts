import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("blocks a key over the limit until the window passes", () => {
    const isAllowed = createRateLimiter({ limit: 2, windowMs: 1000 });

    expect(isAllowed("a", 0)).toBe(true);
    expect(isAllowed("a", 10)).toBe(true);
    expect(isAllowed("a", 20)).toBe(false);
    expect(isAllowed("b", 20)).toBe(true);
    expect(isAllowed("a", 1000)).toBe(true);
  });
});
