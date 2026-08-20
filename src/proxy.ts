import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 renamed `middleware` to `proxy`. It runs on the Node runtime only —
 * the edge runtime is not supported here — so anything added later (rate
 * limiting, for instance) must be Node-compatible.
 *
 * Sets the response security headers.
 */
/*
 * React uses eval() in development for debugging features such as reconstructing
 * callstacks across environments. It never does so in production, so 'unsafe-eval'
 * is granted to the dev server only — shipping it would weaken the policy for no
 * benefit.
 */
const SCRIPT_SRC =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const BASE_DIRECTIVES = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; 'unsafe-inline' is required for them.
  SCRIPT_SRC,
  // Tailwind and next/font emit inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
];

/** True when this request actually arrived over TLS, proxies included. */
function isSecure(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return request.nextUrl.protocol === "https:";
}

export function proxy(request: NextRequest) {
  const secure = isSecure(request);

  /*
   * upgrade-insecure-requests rewrites every http:// subresource to https://.
   * Correct over TLS, actively harmful over plain http — WebKit honours it on
   * localhost (Chromium exempts localhost), so a local production build loses
   * its stylesheet entirely. Gate it on the actual request scheme rather than
   * on NODE_ENV, which cannot tell `npm run start` from a real deploy.
   */
  const directives = secure ? [...BASE_DIRECTIVES, "upgrade-insecure-requests"] : BASE_DIRECTIVES;

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", directives.join("; "));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  // Only meaningful over TLS; browsers ignore it on http, but do not advertise it.
  if (secure) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
