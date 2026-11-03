import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// The zones a building can be in: Indonesia's three. The time maths is date-fns-tz;
// only the local names are ours, because Intl calls them GMT+7, GMT+8 and GMT+9.
export const SITE_TIME_ZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
] as const;

export type SiteTimeZone = (typeof SITE_TIME_ZONES)[number];

export const DEFAULT_TIME_ZONE: SiteTimeZone = "Asia/Jakarta";

const ZONE_LABELS: Record<SiteTimeZone, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

export function asSiteTimeZone(value: string | null | undefined): SiteTimeZone {
  return (SITE_TIME_ZONES as readonly string[]).includes(value ?? "")
    ? (value as SiteTimeZone)
    : DEFAULT_TIME_ZONE;
}

export function timeZoneLabel(timeZone: SiteTimeZone) {
  return ZONE_LABELS[timeZone];
}

// A wall-clock time typed for a building, like a datetime-local value, as the
// moment it means there.
export function fromSiteTime(
  value: string,
  timeZone: string | null | undefined,
) {
  return fromZonedTime(value, asSiteTimeZone(timeZone));
}

// The calendar day a moment falls on in the building's zone, as yyyy-MM-dd.
export function siteDay(date: Date, timeZone: string | null | undefined) {
  return formatInTimeZone(date, asSiteTimeZone(timeZone), "yyyy-MM-dd");
}
