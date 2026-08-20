/**
 * Dev visual check. Not part of CI — tests/e2e covers that.
 *
 * Captures a route and reports the three things worth knowing at a glance:
 * failing requests, horizontal overflow, and anything left invisible.
 *
 * Emulates prefers-reduced-motion so scroll reveals are bypassed and the capture
 * shows settled layout — the correct way to snapshot an animated page.
 *
 *   node scripts/preview.mjs <url> <out.png> [width] [height]
 */
import { chromium } from "@playwright/test";

const [, , url, out, w = "1440", h = "900"] = process.argv;
if (!url || !out) {
  console.error("usage: node scripts/preview.mjs <url> <out.png> [width] [height]");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
await page.emulateMedia({ reducedMotion: "reduce" });

const failed = [];
page.on("response", (r) => {
  if (r.status() >= 400) failed.push(`${String(r.status())} ${r.url()}`);
});
page.on("pageerror", (e) => failed.push(`PAGEERROR ${e.message}`));

const response = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
const invisible = await page.evaluate(() =>
  [...document.querySelectorAll("body *")]
    .filter((el) => {
      const s = getComputedStyle(el);
      return s.opacity === "0" && s.position !== "fixed" && el.getBoundingClientRect().height > 40;
    })
    .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
    .slice(0, 6),
);

await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(
  `status=${String(response?.status())}  overflowPx=${String(overflow)}  ` +
    `invisible=${invisible.length ? invisible.join(" | ") : "none"}  ` +
    `failedRequests=${failed.length ? String(failed.length) : "none"}`,
);
if (failed.length) console.log(failed.join("\n"));
