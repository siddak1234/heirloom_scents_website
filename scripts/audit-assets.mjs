/**
 * Every asset on disk is referenced, and every referenced asset is on disk.
 *
 * Fails the build on either direction, so a redesign cannot strand a file in
 * public/ and a component cannot point at a key that no longer exists.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifest = readFileSync("src/content/media-manifest.ts", "utf8");

/** Keys are the only two-space-indented quoted properties in the generated file. */
function keysIn(block) {
  const section = manifest.split(`export const ${block} = {`)[1]?.split("} as const")[0] ?? "";
  return [...section.matchAll(/^\s{2}"([^"]+)":/gm)].map((m) => m[1]);
}

const imageKeys = keysIn("IMAGES");
const videoKeys = keysIn("VIDEOS");

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
  .filter((f) => !f.endsWith("media-manifest.ts"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const problems = [];

// 1. Nothing on disk is stranded.
for (const key of [...imageKeys, ...videoKeys]) {
  if (!sources.includes(`"${key}"`)) problems.push(`stranded — nothing references "${key}"`);
}

// 2. Every file the manifest names exists, posters included.
for (const m of manifest.matchAll(/(?:src|poster): "(\/[^"]+)"/g)) {
  if (!existsSync(join("public", m[1]))) problems.push(`missing on disk — public${m[1]}`);
}

console.log(`assets: ${String(imageKeys.length)} images, ${String(videoKeys.length)} videos`);

if (problems.length) {
  console.error(`\n✗ ${String(problems.length)} asset problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nDelete the file, or reference it. Then: npm run media:manifest");
  process.exit(1);
}
console.log("✓ assets: all referenced, all present");
