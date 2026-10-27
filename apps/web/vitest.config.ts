import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@streetproof/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
