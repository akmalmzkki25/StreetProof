import { createHash } from "node:crypto";

// Only this hash is stored. The raw receipt stays with the reporter.
export function hashReporterToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
