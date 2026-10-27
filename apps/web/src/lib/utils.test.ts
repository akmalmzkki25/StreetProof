import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("re-exports the shared class merger", () => {
    expect(cn("text-foreground", "bg-background")).toContain("text-foreground");
  });
});
