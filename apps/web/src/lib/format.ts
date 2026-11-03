import {
  asSiteTimeZone,
  fromSiteTime,
  timeZoneLabel,
} from "@streetproof/domain";
import { enGB, id } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

import type { Locale } from "./i18n/translate";

const DATE_FORMATS = {
  en: { pattern: "d MMM yyyy, HH:mm", locale: enGB },
  id: { pattern: "d MMM yyyy, HH.mm", locale: id },
};

// In the building's own zone, named, so a WITA site never reads as WIB.
export function formatDateTime(
  date: Date,
  locale: Locale = "en",
  timeZone?: string | null,
) {
  const zone = asSiteTimeZone(timeZone);
  const format = DATE_FORMATS[locale];
  const text = formatInTimeZone(date, zone, format.pattern, {
    locale: format.locale,
  });
  return `${text} ${timeZoneLabel(zone)}`;
}

// A datetime-local value means the building's time, whatever zone the server runs in.
export function parseSiteInput(value: string, timeZone?: string | null) {
  return fromSiteTime(value, timeZone);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const SHORT_UNITS: Record<
  Locale,
  { under: string; minute: string; hour: string; day: string }
> = {
  en: { under: "Under 1 min", minute: "min", hour: "h", day: "d" },
  id: { under: "Kurang dari 1 mnt", minute: "mnt", hour: "jam", day: "hr" },
};

export function formatDuration(ms: number, locale: Locale = "en") {
  const units = SHORT_UNITS[locale];
  if (ms < MINUTE_MS) return units.under;
  if (ms < HOUR_MS) return `${Math.floor(ms / MINUTE_MS)} ${units.minute}`;
  if (ms < DAY_MS) return `${Math.floor(ms / HOUR_MS)} ${units.hour}`;
  return `${Math.floor(ms / DAY_MS)} ${units.day}`;
}

export function formatDurationInWords(ms: number, locale: Locale = "en") {
  if (locale === "id") {
    if (ms < MINUTE_MS) return "kurang dari semenit";
    if (ms < HOUR_MS) return `${Math.floor(ms / MINUTE_MS)} menit`;
    if (ms < DAY_MS) return `${Math.floor(ms / HOUR_MS)} jam`;
    return `${Math.floor(ms / DAY_MS)} hari`;
  }
  const inUnit = (size: number, unit: string) => {
    const count = Math.floor(ms / size);
    return `${count} ${unit}${count === 1 ? "" : "s"}`;
  };
  if (ms < MINUTE_MS) return "under a minute";
  if (ms < HOUR_MS) return inUnit(MINUTE_MS, "minute");
  if (ms < DAY_MS) return inUnit(HOUR_MS, "hour");
  return inUnit(DAY_MS, "day");
}
