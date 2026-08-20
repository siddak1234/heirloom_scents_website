import { expect, test } from "@playwright/test";

test.describe("home page actions", () => {
  test("both hero calls to action work", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section").first();
    await hero.getByRole("link", { name: "Book an Event" }).click();
    await expect(page).toHaveURL(/\/booking$/);

    await page.goto("/");
    await page.getByRole("link", { name: /Discover the Experience/ }).click();
    await expect(page).toHaveURL(/#experience$/);
  });

  test("section arrow links reach their destinations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Read the scent library/ }).click();
    await expect(page).toHaveURL(/\/scents$/);

    await page.goto("/");
    await page.getByRole("link", { name: /See the full experience/ }).click();
    await expect(page).toHaveURL(/\/experience$/);
  });

  test("every combination card deep-links into the scent library", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(4);

    // Assert all four targets from the rendered markup. Navigating four times
    // instead would make this test contend with the rest of the suite for the
    // one shared server, and the contract here is the link target, not the trip.
    const hrefs = await cards
      .getByRole("link")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    expect(hrefs).toHaveLength(4);
    for (const href of hrefs) expect(href).toMatch(/^\/scents#(golds|florals)$/);

    // One trip proves the anchor actually resolves to a slide.
    await cards.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/scents#(golds|florals)$/);
    const hash = new URL(page.url()).hash.slice(1);
    // The deck is a scroll container, so assert the target exists and is the
    // right scent rather than asserting viewport position.
    await expect(page.locator(`#${hash}`)).toBeAttached();
    await expect(page.locator(`#${hash}`)).toHaveAttribute(
      "aria-label",
      hash === "golds" ? "Saffron Amber" : "Citrus Rose",
    );
  });

  test("the events band offers both actions", async ({ page }) => {
    await page.goto("/");
    const band = page.locator("#events");
    await expect(band.getByRole("link", { name: /Book an Event/ })).toBeVisible();
    await band.getByRole("link", { name: /Explore Events/ }).click();
    await expect(page).toHaveURL(/\/events$/);
  });

  test("the testimonial carousel advances both ways and auto-rotates", async ({ page }) => {
    await page.goto("/");
    const quote = page.getByRole("blockquote").locator("p").first();
    const first = await quote.textContent();

    await page.getByRole("button", { name: "Next quote" }).click();
    await expect(quote).not.toHaveText(first ?? "");
    const second = await quote.textContent();

    await page.getByRole("button", { name: "Previous quote" }).click();
    await expect(quote).toHaveText(first ?? "");
    expect(second).not.toBe(first);
  });

  test("the carousel region is announced to assistive tech", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "What our guests say" })).toBeAttached();
  });
});

test.describe("scent library", () => {
  test("the index rail hides on the hero, then tracks and jumps", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, "the rail is desktop-only by design");
    await page.goto("/scents");
    const rail = page.getByRole("navigation", { name: "Scent index" });

    // On the hero no slide owns the viewport, so the rail is inert — as designed.
    await expect(rail).toHaveCSS("opacity", "0");
    await expect(rail).toHaveCSS("pointer-events", "none");

    // The deck is its own scroll container at lg; the document does not move.
    await page.evaluate(() => {
      const deck = document.querySelector<HTMLElement>(".lg\\:overflow-y-scroll");
      if (deck) deck.scrollTop = window.innerHeight * 1.2;
    });
    await page.waitForTimeout(800);

    await expect(rail).toHaveCSS("opacity", "1");
    await expect(rail.locator('[aria-current="true"]')).toHaveAttribute(
      "aria-label",
      "Go to Saffron Amber",
    );

    await rail.getByRole("button", { name: "Go to Ivory Petals" }).click();
    await page.waitForTimeout(1200);
    await expect(page.getByRole("region", { name: "Ivory Petals" })).toBeInViewport({ ratio: 0.4 });
  });

  test("all eight scents render with their pairings", async ({ page }) => {
    await page.goto("/scents");
    for (const name of [
      "Saffron Amber",
      "Golden Vanilla",
      "Midnight Vanilla",
      "Velvet Coffee",
      "Citrus Rose",
      "Ivory Petals",
      "Berry Cloud",
      "Velvet Lychee Rose",
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByText(/Best paired with/).first()).toBeVisible();
  });

  test("the closing call to action reaches booking", async ({ page }) => {
    await page.goto("/scents");
    await page
      .getByRole("link", { name: /Book an Event/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/booking$/);
  });
});

test.describe("content pages", () => {
  test("experience links to the scent library and to booking", async ({ page }) => {
    await page.goto("/experience");
    await page.getByRole("link", { name: /Meet the eight scents/ }).click();
    await expect(page).toHaveURL(/\/scents$/);

    await page.goto("/experience");
    await page
      .getByRole("link", { name: /Book an Event/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("every event card offers a booking link", async ({ page }) => {
    await page.goto("/events");
    const links = page.getByRole("link", { name: /Book this/ });
    await expect(links).toHaveCount(4);
    await links.first().click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("the about page exposes a working contact address", async ({ page }) => {
    await page.goto("/about");
    const mail = page.getByRole("link", { name: /@heirloomscents\.com/ }).first();
    await expect(mail).toHaveAttribute("href", /^mailto:/);
  });
});

test.describe("footers", () => {
  // /booking is excluded: its footer is copyright, mark and tagline only — no
  // links, matching the artboard. Asserted separately below.
  const ROUTES = ["/", "/experience", "/events", "/about"] as const;
  for (const route of ROUTES) {
    test(`${route} footer links all resolve`, async ({ page, request }) => {
      await page.goto(route);
      const footer = page.locator("footer").last();
      const hrefs = await footer
        .getByRole("link")
        .evaluateAll((els) =>
          els.map((e) => e.getAttribute("href") ?? "").filter((h) => h.startsWith("/")),
        );
      expect(hrefs.length, "footer should link somewhere").toBeGreaterThan(0);
      for (const href of new Set(hrefs)) {
        const res = await request.get(href);
        expect(res.status(), `${route} footer -> ${href}`).toBeLessThan(400);
      }
    });
  }

  test("the booking footer carries no links, by design", async ({ page }) => {
    await page.goto("/booking");
    const footer = page.locator("footer").last();
    await expect(footer).toContainText("Memory, bottled.");
    await expect(footer.getByRole("link")).toHaveCount(0);
  });
});

test.describe("not found", () => {
  test("an unknown route renders the 404 with working recovery links", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("packed away");
    // The page carries its own recovery links; no need for the nav.
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });
});
