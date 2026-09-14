import { expect, test } from "@playwright/test";

/** The five nav destinations, in artboard order, with each page's own h1. */
const NAV = [
  { label: "Home", path: "/", heading: "Scents that speak to you" },
  { label: "Events", path: "/events", heading: "A luxury perfume bar for your event." },
  { label: "Experience", path: "/experience", heading: "Your guests become the perfumer." },
  { label: "Scents", path: "/scents", heading: "Our Scents" },
  { label: "About", path: "/about", heading: "A Dallas house of memory." },
] as const;

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Primary" });

test.describe("the shell, at every width", () => {
  test("the announcement bar reaches booking", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Book Now" }).click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  for (const item of NAV.filter((i) => i.path !== "/")) {
    test(`nav link "${item.label}" reaches ${item.path}`, async ({ page }) => {
      await page.goto("/");
      await nav(page).getByRole("link", { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toContainText(item.heading);
    });
  }

  test('nav link "Home" reaches /', async ({ page }) => {
    await page.goto("/about");
    await nav(page).getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });

  test("Book an Event reaches the booking page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Book an Event" }).click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("the current route is marked and is not a link", async ({ page }) => {
    for (const item of NAV) {
      await page.goto(item.path);
      await expect(nav(page).locator('[aria-current="page"]')).toHaveText(item.label);
      await expect(nav(page).getByRole("link", { name: item.label, exact: true })).toHaveCount(0);
    }
  });

  test("on /booking the CTA is a span, not a link", async ({ page }) => {
    await page.goto("/booking");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Book an Event" })).toHaveCount(0);
    await expect(
      header.locator('[aria-current="page"]', { hasText: "Book an Event" }),
    ).toBeVisible();
  });

  /*
   * Starts from /about rather than /events. The wordmark lives in the shared
   * header, so the page it is clicked from is incidental to what this asserts —
   * and /events decodes five reels, which on a constrained WebKit CI runner was
   * enough to make the synthetic tap miss. /about carries no video.
   */
  test("the wordmark returns home", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /Heirloom Scents — home/ }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });

  test("the nav sticks to the top once the announcement scrolls away", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.scrollTo({ top: 600, behavior: "instant" });
    });
    await expect
      .poll(async () => (await page.getByRole("banner").boundingBox())?.y ?? 99, {
        timeout: 5000,
      })
      .toBeLessThanOrEqual(1);
    const box = await page.getByRole("banner").boundingBox();
    expect(box?.y ?? 99, "header should be pinned at the viewport top").toBeLessThanOrEqual(1);
  });

  /*
   * There is no drawer. The artboards wrap the whole bar into centred rows
   * below their single 861px breakpoint, so every destination stays reachable
   * without a trigger — which is what this asserts.
   */
  test("there is no menu trigger at any width", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /menu/i })).toHaveCount(0);
  });

  test("every destination is visible without opening anything", async ({ page }) => {
    await page.goto("/");
    for (const item of NAV.filter((i) => i.path !== "/")) {
      await expect(nav(page).getByRole("link", { name: item.label, exact: true })).toBeVisible();
    }
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Book an Event" }),
    ).toBeVisible();
  });
});

test.describe("footers", () => {
  const FOOTERS = [
    { path: "/", links: ["Home", "Scents", "Experience", "Events", "About", "Book an Event"] },
    { path: "/about", links: ["Home", "Booking"] },
    { path: "/events", links: ["Home", "Booking"] },
    { path: "/experience", links: ["Home", "Events", "Booking"] },
    { path: "/scents", links: ["Home", "Experience", "Booking"] },
  ] as const;

  for (const footer of FOOTERS) {
    test(`${footer.path} footer carries its own link set, all resolving`, async ({ page }) => {
      await page.goto(footer.path);
      const region = page.locator("footer").last();
      for (const label of footer.links) {
        const link = region.getByRole("link", { name: label, exact: true });
        await expect(link).toHaveAttribute("href", /^\//);
      }
    });
  }

  test("the booking footer carries the tagline instead of links, by design", async ({ page }) => {
    await page.goto("/booking");
    const footer = page.locator("footer").last();
    await expect(footer).toContainText("Memory, bottled.");
    await expect(footer.getByRole("link")).toHaveCount(0);
  });
});
