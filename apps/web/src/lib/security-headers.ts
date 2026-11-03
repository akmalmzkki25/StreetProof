import { MAP_TILE_ORIGIN } from "./map";

function originOf(endpoint: string | undefined) {
  return endpoint && URL.canParse(endpoint) ? new URL(endpoint).origin : null;
}

export function securityHeaders({
  photoEndpoint,
  isDevelopment,
}: {
  photoEndpoint: string | undefined;
  isDevelopment: boolean;
}) {
  const photoOrigin = originOf(photoEndpoint);
  const policy = [
    "default-src 'self'",
    // Prerendered shells can't carry a per-request nonce, so inline scripts stay
    // allowed. Next.js documents the two as incompatible.
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${MAP_TILE_ORIGIN}${photoOrigin ? ` ${photoOrigin}` : ""}`,
    "font-src 'self'",
    // Map styles, tiles, fonts and sprites. Address search goes through our server.
    `connect-src 'self' ${MAP_TILE_ORIGIN}`,
    // MapLibre runs its tile decoding in a worker it makes from a blob.
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  return {
    "Content-Security-Policy": policy,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Our own pages keep the camera, in case a browser ties the photo picker to it,
    // the microphone, for voice notes, and location, for "Use my location" on a
    // map. The browser still asks the person each time.
    "Permissions-Policy":
      "camera=(self), microphone=(self), geolocation=(self)",
    ...(isDevelopment
      ? {}
      : { "Strict-Transport-Security": "max-age=31536000" }),
  };
}
