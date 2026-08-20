import { expect, test } from "@playwright/test";

const NAV = [
  { label: "The Scents", path: "/scents", heading: "Our Scents" },
  { label: "The Experience", path: "/experience", heading: "Your guests become the perfumer." },
  { label: "Events", path: "/events", heading: "Made for life’s most celebrated moments." },
  { label: "About", path: "/about", heading: "A Dallas house of memory." },
] as const;

test.describe("desktop navigation", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop nav only");

  for (const item of NAV) {
    test(`nav link "${item.label}" reaches ${item.path}`, async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: item.label })
        .click();
      await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toContainText(item.heading);
    });
  }

  test("Book an Event reaches the booking page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Book an Event" })
      .click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("the current route is marked and is not a link", async ({ page }) => {
    for (const item of NAV) {
      await page.goto(item.path);
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav.locator(`[aria-current="page"]`)).toHaveText(item.label);
      await expect(nav.getByRole("link", { name: item.label })).toHaveCount(0);
    }
  });

  test("the brand mark returns home", async ({ page }) => {
    await page.goto("/events");
    await page.getByRole("link", { name: /Heirloom Scents — home/ }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });
});

test.describe("mobile menu", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile only");

  test("the trigger is visible and labelled", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    const box = await trigger.boundingBox();
    expect(box?.width ?? 0, "tap target width").toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0, "tap target height").toBeGreaterThanOrEqual(44);
  });

  test("opening reveals every destination and locks the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mobile-nav")).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.locator("#mobile-nav");
    await expect(panel).toBeVisible();
    for (const item of NAV) {
      await expect(panel.getByRole("link", { name: item.label })).toBeVisible();
    }
    await expect(panel.getByRole("link", { name: "Book an Event" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  });

  test("the panel covers the viewport rather than pushing the page down", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const panel = await page.locator("#mobile-nav").boundingBox();
    const viewport = page.viewportSize();
    expect(panel?.height ?? 0).toBeGreaterThan((viewport?.height ?? 0) * 0.6);
  });

  test("the close button closes it and restores scrolling", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("Escape closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).toBeHidden();
  });

  for (const item of NAV) {
    test(`menu link "${item.label}" navigates and closes the menu`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.locator("#mobile-nav").getByRole("link", { name: item.label }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      await expect(page.locator("#mobile-nav")).toBeHidden();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("the menu Book an Event reaches booking", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Book an Event" }).click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("the trigger is absent on desktop widths", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });
});
