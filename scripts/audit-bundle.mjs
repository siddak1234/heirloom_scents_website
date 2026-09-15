/**
 * Guards the server/client boundary in the built output.
 *
 * A single import can drag a server-only library into the browser, and a single
 * misplaced `process.env` can inline a secret into a client chunk, where it is
 * readable by anyone who views source. This catches both.
 *
 * The project holds no server secrets today — the booking flow that needed
 * them was replaced by a hosted scheduler. The denylist is therefore
 * forward-looking: it is the shape of the credentials this site will hold when
 * Shopify and payments land. Add a name here whenever a secret is introduced.
 *
 * Run after `next build`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = ".next/static/chunks";

/** Secret env var NAMES that must never be referenced from a client chunk. */
const FORBIDDEN = [
  { needle: "SHOPIFY_ADMIN_ACCESS_TOKEN", why: "the Shopify Admin token is server-only" },
  { needle: "SHOPIFY_ADMIN_API_TOKEN", why: "the Shopify Admin token is server-only" },
  { needle: "SHOPIFY_WEBHOOK_SECRET", why: "webhook signing secret is server-only" },
  { needle: "STRIPE_SECRET_KEY", why: "the Stripe secret key is server-only" },
  { needle: "STRIPE_WEBHOOK_SECRET", why: "webhook signing secret is server-only" },
];

/**
 * Secret VALUE prefixes. Catches the worse failure — a real credential inlined
 * into the bundle, where the variable name has already been compiled away.
 */
const SECRET_SHAPES = [
  { re: /\bshpat_[0-9a-f]{32}/, why: "a Shopify Admin API access token" },
  { re: /\bshpss_[0-9a-f]{32}/, why: "a Shopify shared secret" },
  { re: /\bsk_live_[0-9A-Za-z]{20}/, why: "a live Stripe secret key" },
  { re: /\bre_[0-9A-Za-z]{20}/, why: "a Resend API key" },
  { re: /\bwhsec_[0-9A-Za-z]{20}/, why: "a webhook signing secret" },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

let chunks;
try {
  chunks = walk(CLIENT_DIR);
} catch {
  console.error(`✗ ${CLIENT_DIR} not found — run \`next build\` first.`);
  process.exit(1);
}

const problems = [];
for (const chunk of chunks) {
  const source = readFileSync(chunk, "utf8");
  for (const { needle, why } of FORBIDDEN) {
    if (source.includes(needle)) problems.push(`${chunk}\n      references "${needle}" — ${why}`);
  }
  for (const { re, why } of SECRET_SHAPES) {
    if (re.test(source)) problems.push(`${chunk}\n      contains what looks like ${why}`);
  }
}

if (problems.length) {
  console.error(`✗ ${String(problems.length)} server/client boundary problem(s):\n`);
  for (const p of problems) console.error("  " + p);
  console.error(
    "\nMove the value behind a server-only module or a route handler. If a secret\n" +
      "has already shipped, rotate it — the bundle is public.",
  );
  process.exit(1);
}
console.log(`✓ bundle: ${String(chunks.length)} client chunks, no leaked credentials`);
