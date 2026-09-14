import { expect, test, type Page } from "@playwright/test";

/** Next day the bar is open: closed Sundays and Mondays, never same-day. */
function nextOpenDay(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1);
  return d;
}

/** DayPicker labels cells "Tuesday, September 15th, 2026". */
function dayCell(page: Page, date: Date) {
  const long = date.toLocaleDateString("en-US", { month: "long" });
  const d = date.getDate();
  return page
    .locator(".hs-daypicker")
    .getByRole("button", {
      name: new RegExp(`${long} ${String(d)}(st|nd|rd|th), ${String(date.getFullYear())}`),
    })
    .first();
}

/**
 * Waits until the booking form is genuinely interactive.
 *
 * The page is server-rendered, so the inputs exist in the DOM before React has
 * hydrated. Typing into them earlier is a real race: react-hook-form has not
 * registered the field yet, so the keystrokes land in the DOM but never reach
 * the form store, and submit then reports the field as empty. A human is never
 * fast enough to hit this; Playwright is.
 *
 * The availability request only fires from an effect after mount, so its
 * response is a reliable signal that the client component is live.
 */
async function gotoBookingReady(page: Page) {
  const availability = page.waitForResponse(
    (r) => r.url().includes("/api/availability") && r.status() === 200,
  );
  await page.goto("/booking");
  await availability;
}

async function fillIdentity(page: Page) {
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
}

/**
 * Drives the happy path through to the confirmation screen.
 * The generous timeout covers the submit round-trip on WebKit under parallel load.
 */
async function completeBooking(page: Page, occasion?: string) {
  const day = nextOpenDay();
  await gotoBookingReady(page);
  await fillIdentity(page);
  if (occasion) await page.getByLabel("The occasion").selectOption(occasion);
  await dayCell(page, day).click();
  await page.getByRole("button", { name: "3:00 PM", exact: true }).click();
  await page.getByRole("button", { name: "Reserve" }).click();
  await expect(page.getByRole("heading", { name: "Your consultation is scheduled." })).toBeVisible({
    timeout: 20_000,
  });
  return day;
}

test.describe("booking — validation", () => {
  test("an empty submission reports both identity fields", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("Add your name.")).toBeVisible();
    await expect(page.getByText("Add your email.")).toBeVisible();
  });

  test("a malformed email is rejected", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByLabel("Your name").fill("Ada");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("That email doesn’t look right.")).toBeVisible();
  });

  test("a day and time are required", async ({ page }) => {
    await gotoBookingReady(page);
    await fillIdentity(page);
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("Pick a day and time.")).toBeVisible();
  });

  test("errors are wired to their field for assistive tech", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByRole("button", { name: "Reserve" }).click();
    const name = page.getByLabel("Your name");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    const describedBy = await name.getAttribute("aria-describedby");
    expect(describedBy, "error must be referenced").toBeTruthy();
    await expect(page.locator(`#${String(describedBy)}`)).toHaveText("Add your name.");
  });
});

test.describe("booking — calendar", () => {
  test("closed days are disabled and unselectable", async ({ page }) => {
    await page.goto("/booking");
    const disabled = page.locator(".hs-daypicker button[disabled]");
    expect(await disabled.count(), "Sundays, Mondays and past days").toBeGreaterThan(0);
  });

  test("month navigation is clamped to the bookable window", async ({ page }) => {
    await gotoBookingReady(page);
    const prev = page.getByRole("button", { name: /Previous Month/i });
    const next = page.getByRole("button", { name: /Next Month/i });

    // The current month is the earliest, so back is unavailable immediately.
    await expect(prev).toBeDisabled();

    // Three months forward is the limit.
    for (let i = 0; i < 3; i++) {
      await expect(next).toBeEnabled();
      await next.click();
      await page.waitForTimeout(250);
    }
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();
  });

  test("times stay disabled until a day is chosen", async ({ page }) => {
    await gotoBookingReady(page);
    await expect(page.getByText("Time · pick a day first")).toBeVisible();
    for (const slot of ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"]) {
      await expect(page.getByRole("button", { name: slot, exact: true })).toBeDisabled();
    }
  });

  test("choosing a day enables the times and names it", async ({ page }) => {
    const day = nextOpenDay();
    await gotoBookingReady(page);
    await dayCell(page, day).click();
    const expected = day.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    await expect(page.getByText(`Time · ${expected}`)).toBeVisible();
    await expect(page.getByRole("button", { name: "3:00 PM", exact: true })).toBeEnabled();
  });

  test("the calendar is a real grid reachable by keyboard", async ({ page }) => {
    await gotoBookingReady(page);
    await expect(page.locator(".hs-daypicker table")).toHaveAttribute("role", "grid");
    const day = nextOpenDay();
    const cell = dayCell(page, day);
    await cell.focus();
    await expect(cell).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "3:00 PM", exact: true })).toBeEnabled();
  });
});

test.describe("booking — end to end", () => {
  test("completes and shows the confirmation with the chosen details", async ({ page }) => {
    const day = await completeBooking(page, "Bridal Shower");

    await expect(page.getByText("Thank you, Ada Lovelace.")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText(/Bridal Shower/)).toBeVisible();

    const expectedWhen = day.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    await expect(page.getByText(new RegExp(`${expectedWhen}.*3:00 PM.*30 min`))).toBeVisible();
    await expect(page.getByText(".ics attached")).toBeVisible();
  });

  test('"Book another" returns to an empty form', async ({ page }) => {
    await completeBooking(page);
    await page.getByRole("button", { name: "Book another" }).click();
    await expect(page.getByRole("heading", { name: "Reserve your consultation." })).toBeVisible();
    await expect(page.getByLabel("Your name")).toHaveValue("");
  });

  test('"Back to home" leaves the confirmation', async ({ page }) => {
    await completeBooking(page);
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });
});

test.describe("booking — API contract", () => {
  test("availability reports closed Sundays and Mondays", async ({ request }) => {
    const now = new Date();
    const month = `${String(now.getFullYear())}-${String(now.getMonth() + 2).padStart(2, "0")}`;
    const res = await request.get(`/api/availability?month=${month}`);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { closedDates: string[] };
    expect(body.closedDates.length).toBeGreaterThan(0);
    for (const iso of body.closedDates) {
      const day = new Date(`${iso}T12:00:00`).getDay();
      expect([0, 1], `${iso} should be a Sunday or Monday`).toContain(day);
    }
  });

  test("a malformed month is refused", async ({ request }) => {
    expect((await request.get("/api/availability?month=nope")).status()).toBe(400);
  });

  test("an invalid booking is refused with field detail", async ({ request }) => {
    const res = await request.post("/api/bookings", { data: { name: "", email: "bad" } });
    expect(res.status()).toBe(422);
    expect(await res.text()).toContain("Invalid booking");
  });

  test("a closed day is refused even when the client asks", async ({ request }) => {
    const sunday = new Date();
    sunday.setDate(sunday.getDate() + 1);
    while (sunday.getDay() !== 0) sunday.setDate(sunday.getDate() + 1);
    const iso = sunday.toISOString().slice(0, 10);
    const res = await request.post("/api/bookings", {
      data: {
        name: "Ada",
        email: "a@example.com",
        occasion: "Wedding",
        date: iso,
        slot: "3:00 PM",
      },
    });
    expect(res.status(), "server must not trust the client").toBe(409);
  });

  test("the honeypot is answered as success and never echoed", async ({ request }) => {
    const day = nextOpenDay().toISOString().slice(0, 10);
    const res = await request.post("/api/bookings", {
      data: {
        name: "Bot",
        email: "b@example.com",
        occasion: "Wedding",
        date: day,
        slot: "3:00 PM",
        company: "x",
      },
    });
    expect(res.status(), "a bot must not learn it was caught").toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty("company");
    expect(body.reference).toBe("HS-IGNORED");
  });
});
