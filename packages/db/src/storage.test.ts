import { describe, expect, it } from "vitest";

import { createStorage, storageConfigFromEnv } from "./storage";

const env = {
  S3_ENDPOINT_URL: "http://minio:9000",
  S3_ACCESS_KEY: "synthetic-key",
  S3_SECRET_KEY: "synthetic-secret",
  S3_BUCKET: "streetproof",
};

describe("signedReadUrl", () => {
  it("signs for the public address, which is the one browsers can reach", async () => {
    const storage = createStorage(
      storageConfigFromEnv({
        ...env,
        S3_PUBLIC_ENDPOINT_URL: "https://files.example.test",
      }),
    );

    const url = new URL(await storage.signedReadUrl("reports/a.jpg"));

    expect(url.origin).toBe("https://files.example.test");
    expect(url.pathname).toBe("/streetproof/reports/a.jpg");
    expect(url.searchParams.get("X-Amz-Signature")).toBeTruthy();
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
  });

  it("uses the normal endpoint when no public one is set", async () => {
    const storage = createStorage(storageConfigFromEnv(env));

    const url = new URL(await storage.signedReadUrl("reports/a.jpg"));

    expect(url.origin).toBe("http://minio:9000");
  });
});
