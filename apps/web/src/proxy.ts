import { NextResponse, type NextRequest } from "next/server";

import { securityHeaders } from "@/lib/security-headers";
import {
  chooseLocale,
  localePath,
  LOCALE_COOKIE,
  splitLocale,
} from "@/lib/i18n/translate";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// Here and not in next.config.ts, whose headers are fixed at build time. The
// photo address comes from the environment the image runs in.
function withSecurityHeaders(response: NextResponse) {
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

// Every page lives under /en or /id. An address without one, like a link in an
// email or a redirect from an action, goes to the language last used here.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname === "/api" || pathname.startsWith("/api/");
  if (isApi) return withSecurityHeaders(NextResponse.next());

  const { locale, path } = splitLocale(pathname);
  if (!locale) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const url = request.nextUrl.clone();
    url.pathname = localePath(chooseLocale(saved), path);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  const response = NextResponse.next();
  // A prefetch of the other language's link isn't someone choosing it.
  const isPrefetch = request.headers.has("next-router-prefetch");
  if (!isPrefetch && request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.APP_URL?.startsWith("https://") ?? false,
      maxAge: ONE_YEAR_SECONDS,
      path: "/",
    });
  }
  return withSecurityHeaders(response);
}

// Files with an extension, like /icon.png, are served as they are.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
