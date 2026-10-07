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

/*
 * Calendly's inline embed needs three origins, and only these three:
 *
 *   assets.calendly.com  the loader script and its stylesheet
 *   calendly.com         the iframe the loader injects
 *
 * It does NOT need 'unsafe-eval', despite what Calendly's own community
 * threads claim. widget.js contains no `eval(` and no `new Function(` — the
 * scheduling app runs inside the iframe, under Calendly's own policy, not ours.
 * Verified against the served file rather than taken on trust.
 *
 * These are added only when a scheduling link is configured, so a deploy
 * without one keeps the tighter policy.
 */
const CALENDLY_ASSETS = "https://assets.calendly.com";
const CALENDLY_FRAME = "https://calendly.com";
const CALENDLY_ENABLED = Boolean(process.env.NEXT_PUBLIC_CALENDLY_URL);

const scriptSrc = CALENDLY_ENABLED ? `${SCRIPT_SRC} ${CALENDLY_ASSETS}` : SCRIPT_SRC;
const styleSrc = CALENDLY_ENABLED
  ? `style-src 'self' 'unsafe-inline' ${CALENDLY_ASSETS}`
  : "style-src 'self' 'unsafe-inline'";

const BASE_DIRECTIVES = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; 'unsafe-inline' is required for them.
  scriptSrc,
  // Tailwind and next/font emit inline style attributes.
  styleSrc,
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  /*
   * frame-src governs what WE may embed. Without it, frames fall back to
   * default-src 'self' and Calendly's iframe is blocked. Note this is the
   * opposite direction from frame-ancestors below, which governs who may
   * embed us and stays at 'none'.
   */
  ...(CALENDLY_ENABLED ? [`frame-src ${CALENDLY_FRAME}`] : ["frame-src 'none'"]),
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
