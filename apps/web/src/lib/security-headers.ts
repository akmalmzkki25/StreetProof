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
    `img-src 'self' data: blob:${photoOrigin ? ` ${photoOrigin}` : ""}`,
    "font-src 'self'",
    "connect-src 'self'",
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
    // Our own pages keep the camera, in case a browser ties the photo picker to it.
    "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
    ...(isDevelopment
      ? {}
      : { "Strict-Transport-Security": "max-age=31536000" }),
  };
}
