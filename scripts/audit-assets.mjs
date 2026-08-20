/**
 * Reports imagery still standing in for the real thing, and any image on disk
 * that no content module references.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifest = readFileSync("src/content/image-manifest.ts", "utf8");
const keys = [...manifest.matchAll(/^\s{2}"([^"]+)":/gm)].map((m) => m[1]);

// Every src/ file that could reference an image key.
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const sources = walk("src")
  .filter((f) => !f.endsWith("image-manifest.ts"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const unreferenced = keys.filter((k) => !sources.includes(`"${k}"`));

let placeholders = [];
try {
  const report = JSON.parse(readFileSync("design-reference/asset-report.json", "utf8"));
  placeholders = report.filter((r) => r.status === "TRUNCATED").map((r) => r.name);
} catch {
  /* extraction report not present */
}

console.log(`images in manifest: ${String(keys.length)}`);
if (unreferenced.length) {
  console.log(`\n⚠ ${String(unreferenced.length)} image(s) on disk that nothing references:`);
  for (const k of unreferenced) console.log(`    ${k}`);
}
if (placeholders.length) {
  console.log(
    `\n⚠ ${String(placeholders.length)} placeholder image(s) awaiting the real photograph:`,
  );
  for (const p of placeholders) console.log(`    public/images/**/${p}`);
  console.log(
    "\n  Replace each file in place at the same dimensions, then run: npm run extract:design",
  );
}
if (!unreferenced.length && !placeholders.length)
  console.log("✓ assets: all real and all referenced");
