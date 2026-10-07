import { expect, test } from "@playwright/test";

/**
 * Scheduling is Calendly's now, so there is nothing here about calendars,
 * slots or availability — that logic is no longer ours to test. What is ours is
 * the page around the embed: the artboard's aside, and the guarantee that the
 * page never silently accepts a booking it cannot honour.
 *
 * The suite follows the same switch the page does. With
 * NEXT_PUBLIC_CALENDLY_URL set at build time the embed renders; without it the
 * page says so and offers a route that works.
 */
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL;

test.describe("booking", () => {
  test("the artboard's aside is intact", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/booking");

    const aside = page.locator("aside");
    await expect(aside).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("One conversation.");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "Reserve your consultation.",
    );

    // The three numbered steps, in order.
    const steps = aside.getByRole("listitem");
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText("Invite sent instantly");
    await expect(steps.nth(1)).toContainText("We plan it on the call");
    await expect(steps.nth(2)).toContainText("Proposal within two days");
  });

  test("the page never offers a dead end", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/booking");

    if (CALENDLY_URL) {
      // Configured: the embed is mounted and pointed at the real link.
      const widget = page.locator(".calendly-inline-widget");
      await expect(widget).toHaveCount(1);
      await expect(widget).toHaveAttribute("data-url", CALENDLY_URL);
    } else {
      // Unconfigured: say so, and give a contact route that works. What must
      // never happen is a form that takes a booking nobody receives.
      await expect(page.getByText(/scheduling link is being set up/i)).toBeVisible();
      const instagram = page.getByRole("link", { name: /Message us on Instagram/ });
      await expect(instagram).toHaveAttribute("href", /instagram\.com\/heirloomscents/);
    }
  });

  test("nothing on the page collects a booking itself", async ({ page }) => {
    await page.goto("/booking");
    // No form, no submit control, and no leftover date or time picker. The
    // hand-built calendar could take a slot that was already committed; this
    // asserts it has not crept back.
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /reserve/i })).toHaveCount(0);
    await expect(page.locator(".hs-daypicker")).toHaveCount(0);
  });

  /*
   * The bug this catches, which the container assertion above could not: the
   * site's CSP is `default-src 'self'` with `script-src 'self'`, which blocks
   * Calendly's loader, its stylesheet and the iframe it injects. The embed
   * markup renders regardless, so a test that only checks the div passes while
   * the widget is dead. Assert the policy instead — it is deterministic and
   * needs no third-party network.
   */
  test("the CSP admits Calendly, and only Calendly", async ({ request }) => {
    const res = await request.get("/booking");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp, "a CSP must be served").not.toBe("");

    const directive = (name: string) =>
      csp
        .split(";")
        .map((d) => d.trim())
        .find((d) => d.startsWith(`${name} `)) ?? "";

    if (CALENDLY_URL) {
      expect(directive("script-src"), "loader blocked").toContain("https://assets.calendly.com");
      expect(directive("style-src"), "widget stylesheet blocked").toContain(
        "https://assets.calendly.com",
      );
      expect(directive("frame-src"), "the scheduling iframe is blocked").toContain(
        "https://calendly.com",
      );
      // Widened for the embed, not in general.
      expect(directive("connect-src")).toBe("connect-src 'self'");
      expect(directive("default-src")).toBe("default-src 'self'");
    } else {
      // Unconfigured: the tighter policy stands, and nothing may be framed.
      expect(csp).not.toContain("calendly.com");
      expect(directive("frame-src")).toBe("frame-src 'none'");
    }

    // Never, in either state.
    expect(csp, "eval must stay blocked in production").not.toContain("'unsafe-eval'");
    expect(directive("frame-ancestors"), "we must not be framable").toBe("frame-ancestors 'none'");
    expect(directive("object-src")).toBe("object-src 'none'");
  });

  test("the deleted booking API is gone", async ({ request }) => {
    for (const path of ["/api/bookings", "/api/availability"]) {
      const res = await request.get(path);
      expect(res.status(), `${path} should no longer exist`).toBe(404);
    }
  });
});
