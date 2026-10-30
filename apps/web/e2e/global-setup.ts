import { execSync } from "node:child_process";

export default function globalSetup() {
  execSync("pnpm --filter @streetproof/db db:e2e:reset", {
    stdio: "inherit",
    env: process.env,
  });
}
