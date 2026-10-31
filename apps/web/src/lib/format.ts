const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(date: Date) {
  return `${dateTimeFormat.format(date)} WIB`;
}

// A datetime-local value means WIB, whatever timezone the server runs in.
export function parseWibInput(value: string) {
  const seconds = value.length === 16 ? ":00" : "";
  return new Date(`${value}${seconds}+07:00`);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatDuration(ms: number) {
  if (ms < MINUTE_MS) return "Under 1 min";
  if (ms < HOUR_MS) return `${Math.floor(ms / MINUTE_MS)} min`;
  if (ms < DAY_MS) return `${Math.floor(ms / HOUR_MS)} h`;
  return `${Math.floor(ms / DAY_MS)} d`;
}

export function formatDurationInWords(ms: number) {
  const inUnit = (size: number, unit: string) => {
    const count = Math.floor(ms / size);
    return `${count} ${unit}${count === 1 ? "" : "s"}`;
  };
  if (ms < MINUTE_MS) return "under a minute";
  if (ms < HOUR_MS) return inUnit(MINUTE_MS, "minute");
  if (ms < DAY_MS) return inUnit(HOUR_MS, "hour");
  return inUnit(DAY_MS, "day");
}
