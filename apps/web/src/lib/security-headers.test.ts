import { describe, expect, it } from "vitest";

import { securityHeaders } from "./security-headers";

function policyOf(options: Parameters<typeof securityHeaders>[0]) {
  return securityHeaders(options)["Content-Security-Policy"];
}

describe("securityHeaders", () => {
  it("allows photos from the storage origin only, not its path", () => {
    const policy = policyOf({
      photoEndpoint: "https://photos.example.test/bucket?x=1",
      isDevelopment: false,
    });

    expect(policy).toContain(
      "img-src 'self' data: blob: https://tiles.openfreemap.org https://photos.example.test;",
    );
  });

  it("still answers when the storage address is missing or malformed", () => {
    for (const photoEndpoint of [undefined, "", "not a url"]) {
      expect(policyOf({ photoEndpoint, isDevelopment: false })).toContain(
        "img-src 'self' data: blob: https://tiles.openfreemap.org;",
      );
    }
  });

  it("lets maps load tiles and run their worker, and nothing else connects out", () => {
    const policy = policyOf({ photoEndpoint: undefined, isDevelopment: false });

    expect(policy).toContain(
      "connect-src 'self' https://tiles.openfreemap.org;",
    );
    expect(policy).toContain("worker-src 'self' blob:");
  });

  it("lets our own pages use the microphone, and no frames can", () => {
    const headers = securityHeaders({
      photoEndpoint: undefined,
      isDevelopment: false,
    });

    expect(headers["Permissions-Policy"]).toContain("microphone=(self)");
    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  it("blocks framing, plugins and forms posting elsewhere", () => {
    const policy = policyOf({ photoEndpoint: undefined, isDevelopment: false });

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("base-uri 'self'");
  });

  it("allows eval and skips HTTPS pinning only in development", () => {
    const development = securityHeaders({
      photoEndpoint: undefined,
      isDevelopment: true,
    });
    const production = securityHeaders({
      photoEndpoint: undefined,
      isDevelopment: false,
    });

    expect(development["Content-Security-Policy"]).toContain("'unsafe-eval'");
    expect(development["Strict-Transport-Security"]).toBeUndefined();
    expect(production["Content-Security-Policy"]).not.toContain(
      "'unsafe-eval'",
    );
    expect(production["Strict-Transport-Security"]).toBe("max-age=31536000");
  });
});
