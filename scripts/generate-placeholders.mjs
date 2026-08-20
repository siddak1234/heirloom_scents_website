/**
 * Generates dimension-accurate placeholder imagery for assets that could not be
 * extracted from the Claude Design project.
 *
 * The design MCP's get_file caps responses at 256 KiB, so every source photograph
 * came back truncated. Real pixel dimensions were recovered from the intact PNG/JPEG
 * headers, so layout is exact — only the photographic content is stand-in.
 *
 * Replacing a placeholder is a drop-in: overwrite the file at the same path and
 * dimensions. See docs/ASSETS.md.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync("design-reference/asset-report.json", "utf8"));

/** Base tints lifted from each scent slide's own overlay gradient in the artboards. */
const TINT = {
  "bottle-saffron-amber": ["#4a2410", "#19100a"],
  "bottle-golden-vanilla": ["#4f3418", "#1e1208"],
  "bottle-midnight-vanilla": ["#2e1a34", "#120810"],
  "bottle-velvet-coffee": ["#402314", "#160c06"],
  "bottle-citrus-rose": ["#54202c", "#1e0a0e"],
  "bottle-ivory-petals": ["#4e4227", "#1c160c"],
  "bottle-berry-cloud": ["#46182f", "#18080e"],
  "bottle-lychee-rose": ["#4d1a2c", "#1a080e"],
  "bg-scents-hero": ["#5b1a24", "#280710"],
};
const DEFAULT_TINT = ["#5c2029", "#2a0d13"];

/** Deterministic per-name jitter so the set does not read as one repeated image. */
function seed(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return h;
}

function svg(width, height, name) {
  const [a, b] = TINT[name.replace(/\.(png|jpe?g)$/, "")] ?? DEFAULT_TINT;
  const s = seed(name);
  const cx = 30 + (s % 40);
  const cy = 25 + ((s >> 3) % 45);
  const angle = s % 90;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="r" cx="${cx}%" cy="${cy}%" r="70%">
      <stop offset="0%" stop-color="#b68235" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="#b68235" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
</svg>`;
}

const out = [];
for (const asset of report) {
  if (asset.status !== "TRUNCATED") continue;
  // bottle-saffron-amber.jpeg had no recoverable header; it shares the bottle geometry.
  const [w, h] = asset.dims ?? [1024, 572];
  const dir = `public/images/${asset.dir}`;
  await mkdir(dir, { recursive: true });
  const path = `${dir}/${asset.name}`;
  const buf = Buffer.from(svg(w, h, asset.name));
  const img = sharp(buf).png({ quality: 90, compressionLevel: 9 });
  await writeFile(
    path,
    await (asset.name.endsWith(".jpeg") ? sharp(buf).jpeg({ quality: 86 }) : img).toBuffer(),
  );
  out.push({ path, width: w, height: h });
  console.log(`placeholder  ${asset.name.padEnd(32)} ${w}x${h}`);
}
console.log(`\n${String(out.length)} placeholders generated.`);
