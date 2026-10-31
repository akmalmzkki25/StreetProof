import { NextResponse } from "next/server";

import { securityHeaders } from "@/lib/security-headers";

// Here and not in next.config.ts, whose headers are fixed at build time. The
// photo address comes from the environment the image runs in.
export function proxy() {
  const response = NextResponse.next();
  const headers = securityHeaders({
    photoEndpoint:
      process.env.S3_PUBLIC_ENDPOINT_URL || process.env.S3_ENDPOINT_URL,
    isDevelopment: process.env.NODE_ENV === "development",
  });
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
