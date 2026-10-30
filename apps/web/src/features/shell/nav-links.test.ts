import { describe, expect, it } from "vitest";

import { navLinksFor } from "./nav-links";

describe("navLinksFor", () => {
  it("gives a technician only their own work", () => {
    expect(navLinksFor(["technician"]).map((link) => link.label)).toEqual([
      "My work",
    ]);
  });

  it("gives each other role its queue and the overview", () => {
    expect(navLinksFor(["operator"]).map((link) => link.label)).toEqual([
      "Queue",
      "Overview",
    ]);
    expect(navLinksFor(["supervisor"]).map((link) => link.label)).toEqual([
      "Reviews",
      "Overview",
    ]);
    expect(navLinksFor(["tenant_admin"]).map((link) => link.label)).toEqual([
      "Overview",
    ]);
  });

  it("lists every destination once for someone holding several roles", () => {
    expect(
      navLinksFor(["supervisor", "operator", "tenant_admin"]).map(
        (link) => link.label,
      ),
    ).toEqual(["Queue", "Reviews", "Overview"]);
  });
});
