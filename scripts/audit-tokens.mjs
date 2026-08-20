/**
 * Standing rule 2: no raw colour values outside the token layer.
 *
 * Fails the build if a hex or rgb()/rgba() literal appears in src/ outside
 * globals.css. Scent overlay tints are exempt — they are data (each slide's own
 * gradient) and live in the content layer, not in markup.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src";
const TOKEN_FILE = "src/styles/globals.css";
const ALLOWLIST = new Set([
  TOKEN_FILE,
  "src/content/scents.ts", // per-scent overlay tints are content, not styling
  "src/app/global-error.tsx", // must not depend on the stylesheet having loaded
  "src/styles/brand-constants.ts", // the JS-side mirror of the token layer
]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB = /\brgba?\(/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of walk(ROOT)) {
  const rel = relative(".", file);
  if (ALLOWLIST.has(rel)) continue;
  const source = readFileSync(file, "utf8");
  source.split("\n").forEach((line, i) => {
    if (line.trimStart().startsWith("*") || line.trimStart().startsWith("//")) return;
    for (const re of [HEX, RGB]) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) problems.push(`${rel}:${String(i + 1)}  ${m[0]}  ${line.trim().slice(0, 80)}`);
    }
  });
}

if (problems.length) {
  console.error(`✗ ${String(problems.length)} raw colour value(s) outside ${TOKEN_FILE}:\n`);
  for (const p of problems) console.error("  " + p);
  console.error("\nAdd a token to globals.css and reference it instead.");
  process.exit(1);
}
console.log("✓ tokens: no raw colour values outside the token layer");
