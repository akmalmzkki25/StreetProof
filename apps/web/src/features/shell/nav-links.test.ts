import { describe, expect, it } from "vitest";

import { navLinksFor } from "./nav-links";

describe("navLinksFor", () => {
  it("gives a technician only their own work", () => {
    expect(navLinksFor(["technician"]).map((link) => link.label)).toEqual([
      "My work",
    ]);
  });

  it("puts the overview first for every other role", () => {
    expect(navLinksFor(["operator"]).map((link) => link.label)).toEqual([
      "Overview",
      "Queue",
    ]);
    expect(navLinksFor(["supervisor"]).map((link) => link.label)).toEqual([
      "Overview",
      "Reviews",
    ]);
    expect(navLinksFor(["tenant_admin"]).map((link) => link.label)).toEqual([
      "Overview",
      "Members",
      "Sites",
      "Audit log",
    ]);
  });

  it("lists every destination once for someone holding several roles", () => {
    expect(
      navLinksFor(["supervisor", "operator", "tenant_admin"]).map(
        (link) => link.label,
      ),
    ).toEqual([
      "Overview",
      "Queue",
      "Reviews",
      "Members",
      "Sites",
      "Audit log",
    ]);
  });
});
