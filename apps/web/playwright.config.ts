import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";

const rootEnv = path.resolve(__dirname, "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const PORT = 3100;
// Set it to test a running deployment, such as the Docker images, as they are.
const externalUrl = process.env.E2E_BASE_URL;
const baseURL = externalUrl ?? `http://localhost:${PORT}`;

function e2eDatabaseUrl() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  url.pathname = `${url.pathname}_e2e`;
  return url.toString();
}

const E2E_DATABASE_URL = e2eDatabaseUrl();
process.env.E2E_DATABASE_URL = E2E_DATABASE_URL;

// A production build on its own port and database, so a run doesn't disturb a
// dev server, its demo data, or a worker that spends model credits.
export default defineConfig({
  testDir: "./e2e",
  ...(externalUrl ? {} : { globalSetup: "./e2e/global-setup.ts" }),
  // One browser at a time: the app's rate limits and the queue are shared.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(externalUrl
    ? {}
    : {
        webServer: {
          command: `pnpm build && pnpm exec next start --port ${PORT}`,
          url: `${baseURL}/login`,
          timeout: 300_000,
          reuseExistingServer: false,
          env: { DATABASE_URL: E2E_DATABASE_URL, APP_URL: baseURL },
        },
      }),
});
