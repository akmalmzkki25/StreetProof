import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";

// The monorepo keeps one .env at the repo root; Next.js only looks in apps/web.
// Next's own loadEnvConfig caches its first directory, so load the file directly.
const rootEnv = path.resolve(process.cwd(), "../../.env");
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

const nextConfig: NextConfig = {
  transpilePackages: [
    "@streetproof/ui",
    "@streetproof/domain",
    "@streetproof/db",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
