// One JSON object per line, so a log collector can search by field. Fields must
// never hold report text, photos, tokens or email addresses.
export function logEvent(
  level: "info" | "warn" | "error",
  message: string,
  fields: Record<string, unknown> = {},
) {
  const entry = { at: new Date().toISOString(), level, message, ...fields };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function errorFields(error: unknown) {
  return error instanceof Error
    ? { error: error.name, detail: error.message }
    : { error: String(error) };
}
