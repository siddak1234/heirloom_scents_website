import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/scents", "/experience", "/events", "/about", "/booking"] as const;

for (const route of ROUTES) {
  test(`${route} renders without errors or overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text());
    });

    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status()).toBe(200);

    // Exactly one h1 per page.
    await expect(page.locator("h1")).toHaveCount(1);

    // Nothing may scroll the document sideways at any viewport.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "horizontal overflow").toBeLessThanOrEqual(1);

    expect(errors, errors.join("\n")).toHaveLength(0);
  });
}

test("every internal link resolves", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href") ?? ""),
  );
  const unique = [...new Set(hrefs.map((h) => h.split("#")[0]).filter(Boolean))];
  for (const href of unique) {
    const res = await request.get(href);
    expect(res.status(), `${href} should resolve`).toBeLessThan(400);
  }
});

// The artboard puts an id on two of the eight slides. Nothing in the site links
// to them any more, but they are stable deep-link targets and are kept.
//
// `domcontentloaded`, not the default `load`: this asserts that an anchor
// resolves to the right slide, which needs the DOM and not nine decoded
// photographs. /scents carries 12MB of imagery, and waiting for all of it twice
// in one test exceeded the 30s budget on a cold CI runner. Image delivery is
// covered by the per-route smoke test above and by the manifest unit test.
test("the two scent anchors the artboard names still land", async ({ page }) => {
  await page.goto("/scents#florals", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#florals")).toContainText("Citrus Rose");
  await page.goto("/scents#golds", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#golds")).toContainText("Saffron Amber");
});

// Safari does not move Tab focus to links unless full keyboard access is on, and
// iOS has no Tab key at all. The skip link is a desktop-keyboard affordance, so
// this is asserted where a keyboard actually exists.
test("skip link is reachable and targets main", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "Safari does not tab to links by default");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("href"));
  expect(focused).toBe("#main");
});
