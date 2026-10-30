import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The monorepo has one .env at the root. Values already in the environment win.
const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));

if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}
