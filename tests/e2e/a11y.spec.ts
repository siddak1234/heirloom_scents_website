import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Reveal animations transiently lower opacity, which axe would sample as a
// contrast failure. Reduced motion pins every element to its final state.
//
// The experience page's step watermark — a 190px numeral at 16% accent, behind
// the heading — is excluded. WCAG 1.4.3 exempts text that is pure decoration,
// and this qualifies on every count: it is aria-hidden, pointer-events:none,
// user-select:none, and the same number is spelled out in readable text
// immediately beside it ("Step One"). Raising it to 4.5:1 would make a
// 190px numeral the loudest thing on the page. See docs/DESIGN-PARITY.md.
const DECORATIVE = ".text-numeral";

const ROUTES = ["/", "/scents", "/experience", "/events", "/about", "/booking"] as const;

for (const route of ROUTES) {
  test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "load" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude(DECORATIVE)
      .analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.description}`).join("\n"),
    ).toEqual([]);
  });
}

test("headings are in a sane order on every route", async ({ page }) => {
  for (const route of ROUTES) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "load" });
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1])),
    );
    expect(levels[0], `${route} should start at h1`).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      const prev = levels[i - 1] ?? 1;
      const cur = levels[i] ?? 1;
      expect(
        cur - prev,
        `${route} skips a heading level at index ${String(i)}`,
      ).toBeLessThanOrEqual(1);
    }
  }
});
