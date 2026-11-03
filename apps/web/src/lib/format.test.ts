import { describe, expect, it } from "vitest";

import {
  formatDateTime,
  formatDuration,
  formatDurationInWords,
  parseSiteInput,
} from "./format";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

describe("parseSiteInput", () => {
  it("reads a datetime-local value in the building's zone", () => {
    expect(parseSiteInput("2026-11-01T10:30").toISOString()).toBe(
      "2026-11-01T03:30:00.000Z",
    );
    expect(
      parseSiteInput("2026-11-01T10:30", "Asia/Jayapura").toISOString(),
    ).toBe("2026-11-01T01:30:00.000Z");
  });
});

describe("formatDateTime", () => {
  it("shows the building's local time and names its zone", () => {
    const moment = new Date("2026-11-01T03:30:00.000Z");
    expect(formatDateTime(moment, "en")).toContain("10:30");
    expect(formatDateTime(moment, "en")).toMatch(/ WIB$/);
    expect(formatDateTime(moment, "en", "Asia/Makassar")).toContain("11:30");
    expect(formatDateTime(moment, "en", "Asia/Makassar")).toMatch(/ WITA$/);
  });
});

describe("formatDuration", () => {
  it("uses the largest whole unit and never rounds up", () => {
    expect(formatDuration(30 * 1000)).toBe("Under 1 min");
    expect(formatDuration(59 * MINUTE)).toBe("59 min");
    expect(formatDuration(HOUR)).toBe("1 h");
    expect(formatDuration(23.9 * HOUR)).toBe("23 h");
    expect(formatDuration(47 * HOUR)).toBe("1 d");
  });
});

describe("formatDurationInWords", () => {
  it("writes the unit out and matches singular and plural", () => {
    expect(formatDurationInWords(30 * 1000)).toBe("under a minute");
    expect(formatDurationInWords(MINUTE)).toBe("1 minute");
    expect(formatDurationInWords(5 * HOUR)).toBe("5 hours");
    expect(formatDurationInWords(24 * HOUR)).toBe("1 day");
    expect(formatDurationInWords(18 * 24 * HOUR)).toBe("18 days");
  });
});
