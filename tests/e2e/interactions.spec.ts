import { expect, test, type Page } from "@playwright/test";

/**
 * The button-by-button sweep: every control the artboards draw, asserted to do
 * what the artboard says it does, at all four viewports.
 *
 * `desk` is the design's single breakpoint (861px). The scent deck's snap and
 * its index rail are desktop-only by design — see docs/DESIGN-PARITY.md — so
 * those assertions skip below it.
 */
const DESK = 861;

async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

test.describe("home — hero slideshow", () => {
  test("both slides' calls to action reach their route", async ({ page }) => {
    await page.goto("/");
    // Slide one.
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Scents that speak to you");
    await page.getByRole("link", { name: "Book Your Event" }).first().click();
    await expect(page).toHaveURL(/\/booking$/);

    // Slide two, reached with the next arrow.
    await page.goto("/");
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Gifts that wow");
    await page.getByRole("link", { name: "See the Experience" }).click();
    await expect(page).toHaveURL(/\/experience$/);
  });

  test("next and previous both change the slide and wrap", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });

    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(h1).toContainText("Gifts that wow");

    // Two slides, so one more forward step wraps back to the first.
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(h1).toContainText("Scents that speak to you");

    // Backwards from the first wraps to the last, rather than going negative.
    await page.getByRole("button", { name: "Previous slide" }).click();
    await expect(h1).toContainText("Gifts that wow");
  });

  test("the dots jump to their slide and mark the current one", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Go to slide 2" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Gifts that wow");
    await expect(page.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page.getByRole("button", { name: "Go to slide 1" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Scents that speak to you");
  });

  test("it does not auto-advance under reduced motion", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const before = await page.getByRole("heading", { level: 1 }).textContent();
    await page.waitForTimeout(8000);
    expect(await page.getByRole("heading", { level: 1 }).textContent()).toBe(before);
  });
});

test.describe("home — scent rail", () => {
  test("all eight cards link into the scent library", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const rail = page.getByRole("list", { name: "The eight house scents" });
    const cards = rail.getByRole("link");
    await expect(cards).toHaveCount(8);
    for (const href of await cards.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toBe("/scents");
    }
  });

  test("the pager scrolls the rail forward and back", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < DESK, "the rail needs room to page");
    await settle(page);
    await page.goto("/");
    const rail = page.getByRole("list", { name: "The eight house scents" });
    const left = () => rail.evaluate((el) => el.scrollLeft);

    expect(await left()).toBe(0);
    await page.getByRole("button", { name: "Scroll scents forward" }).click();
    await expect.poll(left, { timeout: 5000 }).toBeGreaterThan(200);

    await page.getByRole("button", { name: "Scroll scents back" }).click();
    await expect.poll(left, { timeout: 5000 }).toBe(0);
  });
});

test.describe("home — the rest of the page", () => {
  test("each combination card links to the scent library", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(cards.nth(i).getByRole("link", { name: /Read these scents/ })).toHaveAttribute(
        "href",
        "/scents",
      );
    }
  });

  test("the video band and story block reach their routes", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    await page.getByRole("link", { name: /See It In Motion/ }).click();
    await expect(page).toHaveURL(/\/events$/);

    await page.goto("/");
    await page.getByRole("link", { name: /About Us/ }).click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('"Explore All Scents" reaches the library', async ({ page }) => {
    await settle(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Explore All Scents" }).click();
    await expect(page).toHaveURL(/\/scents$/);
  });

  test("the testimonial pager advances both ways", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const quote = page.locator("blockquote");
    const first = await quote.textContent();

    await page.getByRole("button", { name: "Next quote" }).click();
    await expect.poll(async () => quote.textContent(), { timeout: 5000 }).not.toBe(first);

    await page.getByRole("button", { name: "Previous quote" }).click();
    await expect.poll(async () => quote.textContent(), { timeout: 5000 }).toBe(first);
  });

  test("the newsletter rejects an empty and a malformed address", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const form = page.locator("form").filter({ has: page.getByPlaceholder("Your email") });
    const status = form.getByRole("status");

    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(status).toContainText("valid email");

    await form.getByPlaceholder("Your email").fill("not-an-email");
    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(status).toContainText("valid email");

    // A well-formed address is accepted, and says plainly that nothing was stored.
    await form.getByPlaceholder("Your email").fill("guest@example.com");
    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(status).toContainText("not open yet");
  });
});

test.describe("scent library", () => {
  test("all eight slides render with their pairings", async ({ page }) => {
    await settle(page);
    await page.goto("/scents");
    const names = [
      "Saffron Amber",
      "Golden Vanilla",
      "Midnight Vanilla",
      "Velvet Coffee",
      "Citrus Rose",
      "Ivory Petals",
      "Berry Cloud",
      "Velvet Lychee Rose",
    ];
    for (const name of names) {
      const slide = page.locator("[data-scent-slide]").filter({ hasText: name }).first();
      await expect(slide).toContainText("Best paired with");
    }
    await expect(page.locator("[data-scent-slide]")).toHaveCount(8);
  });

  test("the index rail hides at the hero, then tracks and jumps", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < DESK, "the rail is desktop-only, by design");
    await settle(page);
    await page.goto("/scents");

    const rail = page.getByRole("navigation", { name: "Scent index" });
    const opacity = () => rail.evaluate((el) => getComputedStyle(el).opacity);

    // At the hero no scent owns the viewport, so the rail is inert.
    await expect.poll(opacity, { timeout: 6000 }).toBe("0");

    // Scrolling onto the first slide brings it in and marks that scent. The
    // rail cannot be clicked until this happens — it is pointer-events:none
    // while hidden, by design.
    await page.locator("[data-scent-slide]").first().scrollIntoViewIfNeeded();
    await expect.poll(opacity, { timeout: 6000 }).toBe("1");
    await expect(page.getByRole("button", { name: "Saffron Amber" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    // Now it is live, a rail button jumps to its slide and takes the mark.
    await page.getByRole("button", { name: "Ivory Petals" }).click();
    await expect(page.getByRole("button", { name: "Ivory Petals" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.getByRole("button", { name: "Saffron Amber" })).toHaveAttribute(
      "aria-current",
      "false",
    );
  });

  test("the rail is absent below the design's breakpoint", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= DESK, "below desk only");
    await settle(page);
    await page.goto("/scents");
    await expect(page.getByRole("navigation", { name: "Scent index" })).toBeHidden();
  });

  test("the closing call to action reaches booking", async ({ page }) => {
    await settle(page);
    await page.goto("/scents");
    await page
      .getByRole("link", { name: /Book an Event/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/booking$/);
  });
});

test.describe("experience", () => {
  test("only step one links, and it reaches the library", async ({ page }) => {
    await settle(page);
    await page.goto("/experience");
    const link = page.getByRole("link", { name: /Meet the eight scents/ });
    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(/\/scents$/);
  });

  test("the closing band reaches booking", async ({ page }) => {
    await settle(page);
    await page.goto("/experience");
    await page
      .getByRole("link", { name: /Book an Event/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/booking$/);
  });
});

test.describe("events", () => {
  test("the hero and story calls to action reach booking", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    await page.getByRole("link", { name: "Book Your Event" }).click();
    await expect(page).toHaveURL(/\/booking$/);

    await page.goto("/events");
    await page.getByRole("link", { name: "Book Now", exact: true }).last().click();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("all four event cards offer a booking link", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    const links = page.getByRole("link", { name: /Book this/ });
    await expect(links).toHaveCount(4);
    for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toBe("/booking");
    }
  });

  test("each tile opens the lightbox on its own film", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    for (let i = 1; i <= 4; i++) {
      await page.getByRole("button", { name: `Play film ${String(i)} of 4 with sound` }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute("aria-label", `Film ${String(i)} of 4`);
      await expect(dialog.locator("video")).toHaveAttribute("src", `/video/reel-${String(i)}.mp4`);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("the lightbox wraps in both directions", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    const dialog = page.getByRole("dialog");

    await page.getByRole("button", { name: "Play film 1 of 4 with sound" }).click();
    await page.getByRole("button", { name: "Previous film" }).click();
    await expect(dialog).toHaveAttribute("aria-label", "Film 4 of 4");

    await page.getByRole("button", { name: "Next film" }).click();
    await expect(dialog).toHaveAttribute("aria-label", "Film 1 of 4");
  });

  test("the backdrop closes it but the player does not", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    await page.getByRole("button", { name: "Play film 2 of 4 with sound" }).click();
    const dialog = page.getByRole("dialog");

    // A click on the player must not bubble into a close.
    await dialog.locator("video").click({ position: { x: 5, y: 5 }, force: true });
    await expect(dialog).toBeVisible();

    // A click on the backdrop itself closes.
    await dialog.click({ position: { x: 2, y: 2 } });
    await expect(dialog).toBeHidden();
  });

  test("the close button closes it and returns focus to its tile", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    await page.getByRole("button", { name: "Play film 3 of 4 with sound" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("button", { name: "Play film 3 of 4 with sound" })).toBeFocused();
  });

  test("the lightbox player has controls; the tiles stay silent", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    const tiles = page
      .getByRole("list")
      .filter({ has: page.getByRole("button", { name: /Play film/ }) })
      .locator("video");
    await expect(tiles).toHaveCount(4);
    for (const muted of await tiles.evaluateAll((els) =>
      els.map((e) => (e as HTMLVideoElement).muted),
    )) {
      expect(muted).toBe(true);
    }

    await page.getByRole("button", { name: "Play film 1 of 4 with sound" }).click();
    await expect(page.getByRole("dialog").locator("video")).toHaveAttribute("controls", "");
  });
});

test.describe("about", () => {
  test("the contact block exposes a working address", async ({ page }) => {
    await settle(page);
    await page.goto("/about");
    await expect(page.getByText("hello@heirloomscents.com").first()).toBeVisible();
  });
});

test.describe("not found", () => {
  test("an unknown route renders the 404 with working recovery links", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("packed away");

    await page.getByRole("link", { name: "The Scents" }).click();
    await expect(page).toHaveURL(/\/scents$/);
  });
});
