/**
 * Guards the server/client boundary in the built output.
 *
 * A single import can drag a server-only library into the browser: the booking
 * confirmation once imported a date formatter from the email module, which
 * imported the `ics` calendar library — shipping ~190 KB of iCalendar code to
 * every visitor. This catches that class of regression.
 *
 * Run after `next build`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = ".next/static/chunks";

/** Fingerprints that must never appear in a client chunk, with why. */
const FORBIDDEN = [
  { needle: "BEGIN:VCALENDAR", why: "the `ics` calendar library is server-only" },
  { needle: "SUPABASE_SERVICE_ROLE_KEY", why: "service-role key must never reach the browser" },
  { needle: "RESEND_API_KEY", why: "email API key must never reach the browser" },
  { needle: "TURNSTILE_SECRET_KEY", why: "Turnstile secret must never reach the browser" },
  { needle: "guestEmailText", why: "email bodies are server-only" },
  { needle: "hostEmailText", why: "email bodies are server-only" },
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
