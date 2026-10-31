import type { FullConfig } from "@playwright/test";
import { execSync } from "node:child_process";

// Right after a build, the first request to a route can take seconds. Tests have
// short timeouts, so they shouldn't be the ones paying for it.
const ROUTES = [
  "/",
  "/login",
  "/status",
  "/app",
  "/app/queue",
  "/app/work",
  "/app/reviews",
  "/app/dashboard",
  "/app/members",
  "/app/audit",
];

export default async function globalSetup(config: FullConfig) {
  execSync("pnpm --filter @streetproof/db db:e2e:reset", {
    stdio: "inherit",
    env: process.env,
  });

  const baseURL = config.projects[0]?.use.baseURL;
  for (const route of ROUTES) {
    await fetch(`${baseURL}${route}`);
  }
}
