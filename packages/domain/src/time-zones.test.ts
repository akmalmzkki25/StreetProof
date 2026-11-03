import { describe, expect, it } from "vitest";

import {
  asSiteTimeZone,
  fromSiteTime,
  siteDay,
  timeZoneLabel,
} from "./time-zones";

describe("site time zones", () => {
  it("names each Indonesian zone", () => {
    expect(timeZoneLabel("Asia/Jakarta")).toBe("WIB");
    expect(timeZoneLabel("Asia/Makassar")).toBe("WITA");
    expect(timeZoneLabel("Asia/Jayapura")).toBe("WIT");
  });

  it("falls back to WIB for anything it doesn't know", () => {
    expect(asSiteTimeZone("Europe/Berlin")).toBe("Asia/Jakarta");
    expect(asSiteTimeZone(null)).toBe("Asia/Jakarta");
    expect(asSiteTimeZone("Asia/Makassar")).toBe("Asia/Makassar");
  });

  it("reads a typed time in the building's zone", () => {
    expect(fromSiteTime("2026-11-01T10:30", "Asia/Jakarta").toISOString()).toBe(
      "2026-11-01T03:30:00.000Z",
    );
    expect(
      fromSiteTime("2026-11-01T10:30", "Asia/Jayapura").toISOString(),
    ).toBe("2026-11-01T01:30:00.000Z");
  });

  it("puts a moment on the building's calendar day", () => {
    const lateEvening = new Date("2026-11-01T16:30:00.000Z");
    expect(siteDay(lateEvening, "Asia/Jakarta")).toBe("2026-11-01");
    expect(siteDay(lateEvening, "Asia/Jayapura")).toBe("2026-11-02");
  });
});
