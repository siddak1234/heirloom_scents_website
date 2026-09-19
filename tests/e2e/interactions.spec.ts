import { expect, test, type Page } from "@playwright/test";

import { SCENTS } from "@/content/scents";

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

/**
 * Waits until /scents has actually become a snap deck.
 *
 * SnapScope arms it from an effect, so before hydration the document is an
 * ordinary scroll container. A snap is evaluated when a scroll ends, never
 * retroactively — so a scroll that lands one frame early settles wherever it
 * was dropped and no later class can pull it in. Under four parallel projects
 * hydration is slow enough for that to happen, which is what made these
 * assertions flaky; waiting is the fix, not a longer timeout.
 */
async function deckArmed(page: Page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("hs-snap"));
}

/**
 * How close to a slide edge counts as landed, in pixels.
 *
 * Not sub-pixel: where exactly a snap comes to rest varies by a few pixels
 * between runs — measured at 72–77px against a 79px scroll-padding on both this
 * branch and main, so it is the browser's resolution, not the deck's. The bug
 * these tests guard stranded the scroll *hundreds* of pixels from an edge, in
 * the middle of a slide, so ten pixels separates landed from stranded with room
 * to spare while asserting nothing the browser does not promise.
 */
const ON_EDGE = 10;

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
  test("every card links into the scent library", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const rail = page.getByRole("list", { name: "The house scent library" });
    const cards = rail.getByRole("link");
    await expect(cards).toHaveCount(SCENTS.length);
    for (const href of await cards.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toBe("/scents");
    }
  });

  test("the pager scrolls the rail forward and back", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < DESK, "the rail needs room to page");
    await settle(page);
    await page.goto("/");
    const rail = page.getByRole("list", { name: "The house scent library" });
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

  test('"Explore the Scent Library" reaches the library', async ({ page }) => {
    await settle(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Explore the Scent Library" }).click();
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

  /*
   * The Subscribe button stretches to the input's height while they share a
   * line, but collapsed to its 20px text height once the row wrapped on a
   * phone — under the 24px WCAG 2.2 minimum, and off the design, which gives
   * every control a 36px floor.
   */
  test("the Subscribe button keeps the design's control height", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    const button = page.getByRole("button", { name: "Subscribe" });
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(36);
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
  test("every slide renders with its pairings", async ({ page }) => {
    await settle(page);
    await page.goto("/scents");
    for (const scent of SCENTS) {
      const slide = page.locator("[data-scent-slide]").filter({ hasText: scent.name }).first();
      await expect(slide).toContainText("Best paired with");
    }
    await expect(page.locator("[data-scent-slide]")).toHaveCount(SCENTS.length);
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

  /*
   * A slide shorter than the screen puts two scents on it at once. The floor
   * was a flat 560px, which is shorter than every phone viewport bar the SE —
   * a Pixel 7 showed 1.5 slides and nothing pulled them into place.
   *
   * The measure is the snapport, not the raw viewport: the nav is sticky, so a
   * slide can only ever occupy the viewport less scroll-padding-top. Matching
   * that exactly is what keeps the slide a snappable target — see the dead-zone
   * test below.
   */
  test("one slide fills the screen, and its copy is never clipped", async ({ page, viewport }) => {
    await settle(page);
    await page.goto("/scents");
    const height = viewport?.height ?? 0;
    const pad = await page.evaluate(
      () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
    );

    const slides = page.locator("[data-scent-slide]");
    await expect(slides).toHaveCount(SCENTS.length);

    for (let i = 0; i < SCENTS.length; i++) {
      const slide = slides.nth(i);
      await slide.scrollIntoViewIfNeeded();
      const box = await slide.boundingBox();
      // Above `desk` the artboard's own calc() governs and is deliberately
      // shorter than the viewport, because the nav takes the remainder.
      if (height && (viewport?.width ?? 0) < DESK) {
        expect(
          box?.height ?? 0,
          `slide ${String(i + 1)} does not fill the screen below the nav`,
        ).toBeGreaterThanOrEqual(height - pad - 1);
      }
      // The copy must fit whatever height the slide settled at.
      const clipped = await slide.evaluate((el) => {
        const inner = el.querySelector("div.relative");
        return inner ? inner.scrollHeight - el.getBoundingClientRect().height : 0;
      });
      expect(clipped, `slide ${String(i + 1)} clips its copy`).toBeLessThanOrEqual(0);
    }
  });

  /*
   * The bug this guards: a slide sized to the whole viewport is 79px taller
   * than the snapport, which makes it an oversized snap target — the browser
   * then refuses to snap through its middle, and the deck only caught near a
   * slide edge. A normal swipe died in the dead band between. Release at every
   * tenth of a slide; every one of them must settle on an edge.
   */
  test("a swipe released anywhere settles on a slide edge", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= DESK, "the dead band was a phone-only bug");
    await page.goto("/scents");
    await deckArmed(page);

    const pitch = await page.evaluate(() => {
      const slides = document.querySelectorAll<HTMLElement>("[data-scent-slide]");
      return slides[1] && slides[0]
        ? slides[1].getBoundingClientRect().top - slides[0].getBoundingClientRect().top
        : 0;
    });

    /*
     * The dead band ran through the middle of a slide; the edges always caught.
     * Five releases across it, rather than every tenth — the suite shares one
     * server across four projects and each settle costs wall clock.
     *
     * The assertion is live: after the scroll ends, some slide's top must be
     * sitting against the snapport edge. That is the property the bug broke,
     * and reading it from the DOM avoids depending on a scroll offset computed
     * before the sticky header finished settling.
     */
    for (const percent of [20, 35, 50, 65, 80]) {
      await page.evaluate(
        ([p, step]) => {
          const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
          const slide = document.querySelectorAll<HTMLElement>("[data-scent-slide]")[2];
          if (slide) {
            const edge = slide.getBoundingClientRect().top + window.scrollY - pad;
            window.scrollTo({ top: Math.round(edge + (step * p) / 100), behavior: "instant" });
          }
        },
        [percent, pitch],
      );

      await expect
        .poll(
          async () =>
            page.evaluate((tolerance) => {
              const pad =
                parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
              return [...document.querySelectorAll<HTMLElement>("[data-scent-slide]")].some(
                (s) => Math.abs(s.getBoundingClientRect().top - pad) <= tolerance,
              );
            }, ON_EDGE),
          {
            timeout: 8000,
            message: `released ${String(percent)}% into the slide and never settled on an edge`,
          },
        )
        .toBe(true);
    }
  });

  test("the closing pane gives up its footer", async ({ page }) => {
    await page.goto("/scents");
    await deckArmed(page);
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    });
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const footer = document.querySelector("footer");
            if (!footer) return false;
            const rect = footer.getBoundingClientRect();
            return rect.bottom <= window.innerHeight + 2 && rect.top < window.innerHeight;
          }),
        { timeout: 5000 },
      )
      .toBe(true);
  });

  /*
   * Deliberately not under reduced motion: globals.css releases the snap
   * entirely for `prefers-reduced-motion`, so emulating it here would assert
   * the opposite of what this test is for. The companion assertion is below.
   */
  test("the deck snaps to a slide edge", async ({ page }) => {
    await page.goto("/scents");
    await deckArmed(page);

    /*
     * Measured live, not against a scroll offset worked out beforehand. What
     * has to hold is that the slide comes to rest against the snapport's top
     * edge — scroll-padding-top below the sticky nav. Reading the slide's own
     * rect at assert time states exactly that and survives the sub-pixel
     * settling the sticky header does on first paint, which a precomputed
     * scrollY integer does not.
     */
    const restsOnSlideThree = () =>
      page.evaluate((tolerance) => {
        const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const slide = document.querySelectorAll<HTMLElement>("[data-scent-slide]")[2];
        return slide ? Math.abs(slide.getBoundingClientRect().top - pad) <= tolerance : false;
      }, ON_EDGE);

    // Land just short of the slide's edge; the deck should pull onto it.
    await page.evaluate(() => {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const slide = document.querySelectorAll<HTMLElement>("[data-scent-slide]")[2];
      if (slide) {
        window.scrollTo({
          top: slide.getBoundingClientRect().top + window.scrollY - pad - 40,
          behavior: "instant",
        });
      }
    });

    await expect.poll(restsOnSlideThree, { timeout: 10_000 }).toBe(true);
  });

  test("reduced motion releases the snap, so nothing can trap the scroll", async ({ page }) => {
    await settle(page);
    await page.goto("/scents");
    await deckArmed(page);
    await expect
      .poll(
        async () => page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType),
        { timeout: 5000 },
      )
      .toBe("none");
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
    const link = page.getByRole("link", { name: /Meet our signature scents/ });
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

  /*
   * The artboard draws this badge with the ▶ character (U+25B6), which macOS
   * and iOS render as a colour emoji. The classical readme's instruction is
   * "Use Lucide icons throughout", so the badge is an inline SVG.
   */
  test("the play badge is a real icon, not an emoji glyph", async ({ page }) => {
    await settle(page);
    await page.goto("/events");
    const tile = page.getByRole("button", { name: "Play film 1 of 4 with sound" });
    await expect(tile.locator("svg")).toHaveCount(1);
    await expect(tile).not.toContainText("▶");
  });

  /*
   * The player is capped at 80vw, so 80vw plus two 46px arrows, two 28px gaps
   * and 48px of padding overflows every phone. Below `desk` the row wraps and
   * the arrows drop beneath the player; above it, the artboard's single row is
   * kept. Either way nothing may leave the viewport.
   */
  test("the lightbox keeps every control on screen", async ({ page, viewport }) => {
    await settle(page);
    await page.goto("/events");
    await page.getByRole("button", { name: "Play film 1 of 4 with sound" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const width = viewport?.width ?? 0;
    for (const label of ["Previous film", "Next film", "Close"]) {
      const box = await dialog.getByRole("button", { name: label }).boundingBox();
      expect(box, `${label} should have a box`).not.toBeNull();
      expect(box?.x ?? -1, `${label} clipped at the left edge`).toBeGreaterThanOrEqual(0);
      expect(
        (box?.x ?? 0) + (box?.width ?? 0),
        `${label} clipped at the right edge`,
      ).toBeLessThanOrEqual(width);
    }

    // Above the design's breakpoint the artboard's arrangement must be intact:
    // one row, previous to the left of the player, next to its right.
    if (width >= DESK) {
      const prev = await dialog.getByRole("button", { name: "Previous film" }).boundingBox();
      const next = await dialog.getByRole("button", { name: "Next film" }).boundingBox();
      const player = await dialog.locator("video").boundingBox();
      expect((prev?.x ?? 0) + (prev?.width ?? 0)).toBeLessThanOrEqual(player?.x ?? 0);
      expect(next?.x ?? 0).toBeGreaterThanOrEqual((player?.x ?? 0) + (player?.width ?? 0));
    }
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
  test("the contact block offers only routes that work", async ({ page }) => {
    await settle(page);
    await page.goto("/about");
    const contact = page.locator("section", { hasText: "Follow along" }).last();
    await expect(contact.getByText("Dallas, Texas").first()).toBeVisible();
    await expect(contact.getByText("@heirloomscents")).toBeVisible();
    await expect(contact.getByRole("link", { name: "Book a consultation" })).toHaveAttribute(
      "href",
      "/booking",
    );
  });
});

/*
 * There is no public mailbox. This guards the whole site against one creeping
 * back in — a `mailto:` link that bounces is worse than no link at all.
 */
test.describe("contact surface", () => {
  const ROUTES = ["/", "/scents", "/experience", "/events", "/about", "/booking"] as const;

  for (const route of ROUTES) {
    test(`${route} offers no mailto link and names no @heirloomscents.com address`, async ({
      page,
    }) => {
      await settle(page);
      await page.goto(route);
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.getByText(/@heirloomscents\.com/)).toHaveCount(0);
    });
  }
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
