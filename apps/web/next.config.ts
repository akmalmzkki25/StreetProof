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
  // Only in the Docker image, which runs the traced server on its own.
  ...(process.env.NEXT_OUTPUT === "standalone"
    ? {
        output: "standalone" as const,
        outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
      }
    : {}),
  poweredByHeader: false,
  // No public home page: /en and /id open the signed-in member's first page.
  // The proxy sends "/" and other unprefixed addresses to a language first.
  async redirects() {
    return [
      { source: "/:lang(en|id)", destination: "/:lang/app", permanent: false },
    ];
  },
  transpilePackages: [
    "@streetproof/ui",
    "@streetproof/contracts",
    "@streetproof/domain",
    "@streetproof/db",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    // Report form: up to three photos of 10 MB each, plus the text fields.
    serverActions: { bodySizeLimit: "32mb" },
  },
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
