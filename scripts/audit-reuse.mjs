/**
 * Standing rule 1 (the Reuse Gate), mechanised.
 *
 * Flags long Tailwind class strings that appear verbatim in more than one file —
 * a reliable signal that a component was copied instead of a variant being added.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const MIN_CLASSES = 5; // shorter strings collide by coincidence
const MAX_ALLOWED = 1; // a string may appear in at most this many files

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

const seen = new Map();
for (const file of walk("src")) {
  const rel = relative(".", file);
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/"([a-z0-9:\-[\]()/.,%_\s]{40,})"/g)) {
    const value = m[1].trim().replace(/\s+/g, " ");
    if (value.split(" ").length < MIN_CLASSES) continue;
    if (!/^[a-z]/.test(value)) continue;
    const files = seen.get(value) ?? new Set();
    files.add(rel);
    seen.set(value, files);
  }
}

const dupes = [...seen.entries()].filter(([, files]) => files.size > MAX_ALLOWED);
if (dupes.length) {
  console.error(`✗ ${String(dupes.length)} duplicated class string(s):\n`);
  for (const [value, files] of dupes) {
    console.error(`  "${value.slice(0, 90)}…"`);
    for (const f of files) console.error(`      ${f}`);
  }
  console.error("\nExtract a primitive or add a variant instead of repeating the string.");
  process.exit(1);
}
console.log("✓ reuse: no class string is duplicated across files");
