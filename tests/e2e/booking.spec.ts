import { expect, test, type Page } from "@playwright/test";

/*
 * The booking page against tests/mocks/calendly-api.mjs, which serves
 * Tue/Wed/Fri/Sat at 10:00, 12:30, 15:00 and 17:30 Chicago time, Thursday fully
 * booked, Sunday and Monday closed, nothing inside 24 hours.
 *
 * Calendly's popup script is replaced per test by a stub that records what it
 * was asked to open, so the hand-off is asserted exactly: which URL, and which
 * answers were pre-filled. Calendly's "booked" signal is then simulated as the
 * postMessage its iframe sends.
 */

const ZONE = "America/Chicago";
const OPEN_WEEKDAYS = [2, 3, 5, 6];
const SCHEDULING_URL = "https://calendly.com/heirloom-e2e/consultation";

/** Today in the business's zone, YYYY-MM-DD. */
function zonedToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(new Date());
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const weekday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();

/** The first day the mock has times: two days out clears the 24-hour notice. */
function nextOpenDay(): string {
  let day = addDays(zonedToday(), 2);
  while (!OPEN_WEEKDAYS.includes(weekday(day))) day = addDays(day, 1);
  return day;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthsAfterThis(iso: string): number {
  const [ty = 0, tm = 0] = zonedToday().split("-").map(Number);
  const [y = 0, m = 0] = iso.split("-").map(Number);
  return (y - ty) * 12 + (m - tm);
}

/** "Friday, October 30, 2026" for an ISO day. */
function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** DayPicker labels cells "Friday, October 30th, 2026". */
function dayCell(page: Page, iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const month = d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return page
    .locator(".hs-daypicker")
    .getByRole("button", {
      name: new RegExp(
        `${month} ${String(d.getUTCDate())}(st|nd|rd|th), ${String(d.getUTCFullYear())}`,
      ),
    })
    .first();
}

function availabilityResponse(page: Page) {
  return page.waitForResponse((r) => r.url().includes("/api/availability") && r.status() === 200);
}

/**
 * Waits until the booking form is genuinely interactive.
 *
 * The page is server-rendered, so the inputs exist in the DOM before React has
 * hydrated; typing earlier lands keystrokes the form never sees. Availability is
 * fetched from an effect after mount, so its response is a reliable signal that
 * the client component is live.
 */
async function gotoBookingReady(page: Page) {
  const availability = availabilityResponse(page);
  await page.goto("/booking");
  await availability;
}

async function showMonthOf(page: Page, iso: string) {
  for (let i = 0; i < monthsAfterThis(iso); i++) {
    const availability = availabilityResponse(page);
    await page.getByRole("button", { name: /Next Month/i }).click();
    await availability;
  }
}

async function pickDayAndTime(page: Page, iso: string, time = "3:00 PM") {
  await showMonthOf(page, iso);
  await dayCell(page, iso).click();
  await page.getByRole("button", { name: time, exact: true }).click();
}

async function fillIdentity(page: Page) {
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Phone").fill("(214) 555-0123");
}

interface PopupCall {
  url: string;
  prefill: { name: string; email: string; customAnswers: Record<string, string> };
}

interface CalendlyStub {
  __calendly: { opened: PopupCall[]; closed: number };
}

/** Replaces Calendly's widget with a recorder. Must run before navigation. */
async function stubCalendly(page: Page) {
  await page.route("https://assets.calendly.com/**", (route) => {
    if (route.request().url().endsWith(".js")) {
      return route.fulfill({
        contentType: "application/javascript",
        body: `
          window.__calendly = { opened: [], closed: 0 };
          window.Calendly = {
            initPopupWidget: (options) => { window.__calendly.opened.push(options); },
            closePopupWidget: () => { window.__calendly.closed += 1; },
          };`,
      });
    }
    return route.fulfill({ contentType: "text/css", body: "" });
  });
}

function popupCalls(page: Page) {
  return page.evaluate(() => (window as unknown as CalendlyStub).__calendly.opened);
}

/** What Calendly's iframe posts to the page. */
async function calendlySays(page: Page, event: string, origin = "https://calendly.com") {
  await page.evaluate(
    ([name, from]) => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: from,
          data: { event: name, payload: { event: { uri: "e" }, invitee: { uri: "i" } } },
        }),
      );
    },
    [event, origin] as const,
  );
}

/** Fills every field, picks a time, and opens Calendly's window. */
async function reserve(page: Page) {
  const day = nextOpenDay();
  await stubCalendly(page);
  await gotoBookingReady(page);
  await fillIdentity(page);
  await page.getByLabel("The occasion").selectOption("Other");
  await page.getByLabel("Your occasion").fill("Graduation");
  await pickDayAndTime(page, day);
  await page.getByLabel("Anything else we should know? (optional)").fill("About 120 guests.");
  await page.getByRole("button", { name: "Reserve" }).click();
  // DayPicker's month caption is also a live region, so match the note by text.
  await expect(page.getByRole("status").filter({ hasText: "Schedule Event" })).toBeVisible();
  return day;
}

test.describe("booking — validation", () => {
  test("an empty submission reports every missing answer at once", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("Add your name.")).toBeVisible();
    await expect(page.getByText("Add your email.")).toBeVisible();
    await expect(page.getByText("Add your phone number.")).toBeVisible();
    await expect(page.getByText("Pick a day and time.")).toBeVisible();
  });

  test("a malformed email is rejected", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("That email doesn’t look right.")).toBeVisible();
  });

  test("a phone number that cannot be dialled is rejected", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByLabel("Phone").fill("555-01");
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText(/That number doesn’t look right/)).toBeVisible();
  });

  test('"Other" asks for the occasion, and requires it', async ({ page }) => {
    await gotoBookingReady(page);
    await expect(page.getByLabel("Your occasion")).toHaveCount(0);
    await page.getByLabel("The occasion").selectOption("Other");
    await expect(page.getByLabel("Your occasion")).toBeVisible();
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText("Tell us the occasion.")).toBeVisible();
    await page.getByLabel("The occasion").selectOption("Wedding");
    await expect(page.getByLabel("Your occasion")).toHaveCount(0);
  });

  test("errors are wired to their field for assistive tech", async ({ page }) => {
    await gotoBookingReady(page);
    await page.getByRole("button", { name: "Reserve" }).click();
    const phone = page.getByLabel("Phone");
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    const describedBy = await phone.getAttribute("aria-describedby");
    expect(describedBy, "error must be referenced").toBeTruthy();
    await expect(page.locator(`#${String(describedBy)}`)).toHaveText("Add your phone number.");
  });
});

test.describe("booking — live availability", () => {
  test("open days are exactly the days Calendly has times", async ({ page }) => {
    await gotoBookingReady(page);
    // Late in a month there may be nothing left in it; the next month always has days.
    await showMonthOf(page, nextOpenDay());
    const enabled = page.locator(".hs-daypicker button:not([disabled])[aria-label]");
    const labels = await enabled.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label") ?? ""),
    );
    const days = labels.filter((l) => /\d{4}/.test(l));
    expect(days.length, "some days open").toBeGreaterThan(0);
    for (const label of days) {
      expect(label, "only Tue, Wed, Fri and Sat have times").toMatch(
        /Tuesday|Wednesday|Friday|Saturday/,
      );
    }
    // Thursday is fully booked in Calendly, so it is greyed like a closed day.
    const thursdays = page.locator('.hs-daypicker button[aria-label*="Thursday"]');
    for (const thursday of await thursdays.all()) await expect(thursday).toBeDisabled();
  });

  test("month navigation is clamped to six months ahead", async ({ page }) => {
    await gotoBookingReady(page);
    const prev = page.getByRole("button", { name: /Previous Month/i });
    const next = page.getByRole("button", { name: /Next Month/i });
    await expect(prev).toBeDisabled();
    for (let i = 0; i < 6; i++) {
      await expect(next).toBeEnabled();
      const availability = availabilityResponse(page);
      await next.click();
      await availability;
    }
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();
  });

  test("no times show until a day is chosen", async ({ page }) => {
    await gotoBookingReady(page);
    await expect(page.getByText("Time · pick a day first")).toBeVisible();
    await expect(page.getByText("Open times for the day you pick appear here.")).toBeVisible();
    await expect(page.getByRole("button", { name: "3:00 PM", exact: true })).toHaveCount(0);
  });

  test("choosing a day lists Calendly's times in the visitor's zone", async ({ page }) => {
    const day = nextOpenDay();
    await gotoBookingReady(page);
    await showMonthOf(page, day);
    await dayCell(page, day).click();
    const heading = new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    await expect(page.getByText(`Time · ${heading}`)).toBeVisible();
    for (const time of ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"]) {
      await expect(page.getByRole("button", { name: time, exact: true })).toBeVisible();
    }
    await expect(page.getByText(/Times in Central (Daylight|Standard) Time/)).toBeVisible();
  });

  test("the calendar is a real grid reachable by keyboard", async ({ page }) => {
    const day = nextOpenDay();
    await gotoBookingReady(page);
    await expect(page.locator(".hs-daypicker table")).toHaveAttribute("role", "grid");
    await showMonthOf(page, day);
    const cell = dayCell(page, day);
    await cell.focus();
    await expect(cell).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "3:00 PM", exact: true })).toBeVisible();
  });

  test("a scheduler outage says so and offers a route that works", async ({ page }) => {
    await page.route("**/api/availability**", (route) =>
      route.fulfill({ status: 503, json: { error: "not-configured" } }),
    );
    await page.goto("/booking");
    await expect(page.getByText("Online booking is briefly unavailable.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Message us on Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/heirloomscents",
    );
  });

  test("a failed load can be retried", async ({ page }) => {
    await page.route("**/api/availability**", (route) =>
      route.fulfill({ status: 502, json: { error: "upstream" } }),
    );
    await page.goto("/booking");
    await expect(page.getByText("We couldn’t load open times.")).toBeVisible();
    await page.unroute("**/api/availability**");
    const availability = availabilityResponse(page);
    await page.getByRole("button", { name: "Try again" }).click();
    await availability;
    await expect(page.getByText("We couldn’t load open times.")).toHaveCount(0);
  });
});

test.describe("booking — hand-off to Calendly", () => {
  test("Reserve opens Calendly at the chosen time with every answer filled in", async ({
    page,
  }) => {
    const day = await reserve(page);
    const [call] = await popupCalls(page);
    expect(call, "Calendly's window was opened").toBeDefined();
    if (!call) return;

    expect(call.url.startsWith(`${SCHEDULING_URL}/`), call.url).toBe(true);
    const instant = new Date(call.url.slice(SCHEDULING_URL.length + 1));
    expect(new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(instant)).toBe(day);
    expect(
      new Intl.DateTimeFormat("en-US", { timeZone: ZONE, timeStyle: "short" }).format(instant),
    ).toBe("3:00 PM");

    expect(call.prefill).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      customAnswers: { a1: "+12145550123", a2: "Other – Graduation", a3: "About 120 guests." },
    });
  });

  test("the confirmation appears only when Calendly reports the booking", async ({ page }) => {
    const day = await reserve(page);

    // A message from anywhere but Calendly is ignored.
    await calendlySays(page, "calendly.event_scheduled", "https://example.com");
    await expect(page.getByRole("heading", { name: "Reserve your consultation." })).toBeVisible();

    await calendlySays(page, "calendly.event_scheduled");
    await expect(
      page.getByRole("heading", { name: "Your consultation is scheduled." }),
    ).toBeVisible();
    await expect(page.getByText("Thank you, Ada Lovelace.")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText(/Other – Graduation/)).toBeVisible();
    await expect(page.getByText(`${longDate(day)} · 3:00 PM (30 min)`)).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as CalendlyStub).__calendly.closed),
    ).toBeGreaterThan(0);
  });

  test("a time changed inside Calendly is not misreported", async ({ page }) => {
    await reserve(page);
    await calendlySays(page, "calendly.date_and_time_selected");
    await calendlySays(page, "calendly.event_scheduled");
    await expect(page.getByText("As confirmed in your Calendly invite")).toBeVisible();
    await expect(page.getByText(/3:00 PM \(30 min\)/)).toHaveCount(0);
  });

  test("if Calendly's window cannot load, the guest is told", async ({ page }) => {
    await page.route("https://assets.calendly.com/**", (route) => route.abort());
    await gotoBookingReady(page);
    await fillIdentity(page);
    await pickDayAndTime(page, nextOpenDay());
    await page.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByText(/We couldn’t open the booking window/)).toBeVisible();
  });

  test('"Book another" returns to an empty form', async ({ page }) => {
    await reserve(page);
    await calendlySays(page, "calendly.event_scheduled");
    await page.getByRole("button", { name: "Book another" }).click();
    await expect(page.getByRole("heading", { name: "Reserve your consultation." })).toBeVisible();
    await expect(page.getByLabel("Your name")).toHaveValue("");
  });

  test('"Back to home" leaves the confirmation', async ({ page }) => {
    await reserve(page);
    await calendlySays(page, "calendly.event_scheduled");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });
});

test.describe("booking — availability API", () => {
  test("serves Calendly's times, the duration and the pre-fill map", async ({ request }) => {
    const month = monthKey(nextOpenDay());
    const res = await request.get(`/api/availability?month=${month}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toContain("s-maxage=60");
    const body = (await res.json()) as {
      durationMinutes: number;
      times: { start: string; url: string }[];
      answerKeys: Record<string, string | null>;
    };
    expect(body.durationMinutes).toBe(30);
    expect(body.answerKeys).toEqual({ phone: "a1", occasion: "a2", notes: "a3" });
    expect(body.times.length).toBeGreaterThan(0);
    for (const t of body.times) expect(t.url.startsWith(`${SCHEDULING_URL}/`)).toBe(true);
  });

  test("a malformed month is refused", async ({ request }) => {
    expect((await request.get("/api/availability?month=nope")).status()).toBe(400);
  });

  test("a month past the bookable window is refused", async ({ request }) => {
    const [y = 0, m = 0] = zonedToday().split("-").map(Number);
    const far = `${String(y + 1)}-${String(m).padStart(2, "0")}`;
    expect((await request.get(`/api/availability?month=${far}`)).status()).toBe(400);
  });
});
