/**
 * Guards the server/client boundary in the built output.
 *
 * A single import can drag server-only code into the browser, and a single
 * misplaced `process.env` can inline a secret into a client chunk, where anyone
 * who views source can read it. This catches both.
 *
 * The one secret today is CALENDLY_TOKEN, read by
 * `features/booking/lib/calendly-api.ts`. The rest of the list is the shape of
 * the credentials this site will hold when Shopify and payments land — add a
 * name here whenever a secret is introduced.
 *
 * Run after `next build`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = ".next/static/chunks";

/** Fingerprints that must never appear in a client chunk, with why. */
const FORBIDDEN = [
  { needle: "CALENDLY_TOKEN", why: "the Calendly API token is server-only" },
  {
    needle: "api.calendly.com",
    why: "only the server calls Calendly's API — the token-bearing client has leaked",
  },
  { needle: "SHOPIFY_ADMIN_ACCESS_TOKEN", why: "the Shopify Admin token is server-only" },
  { needle: "SHOPIFY_WEBHOOK_SECRET", why: "webhook signing secret is server-only" },
  { needle: "STRIPE_SECRET_KEY", why: "the Stripe secret key is server-only" },
  { needle: "STRIPE_WEBHOOK_SECRET", why: "webhook signing secret is server-only" },
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
    if (source.includes(needle)) problems.push(`${chunk}\n      contains "${needle}" — ${why}`);
  }
}

if (problems.length) {
  console.error(`✗ server-only code found in ${String(problems.length)} client chunk(s):\n`);
  for (const p of problems) console.error("  " + p);
  console.error(
    "\nSplit the shared helper into its own module so the client does not pull the server dependency.",
  );
  process.exit(1);
}
console.log(`✓ bundle: ${String(chunks.length)} client chunks, no server-only code`);
