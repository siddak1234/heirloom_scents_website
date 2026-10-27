import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${String(PORT)}`;

/** tests/mocks/calendly-api.mjs — the stand-in for Calendly's API. */
const CALENDLY_MOCK_PORT = 3101;
const CALENDLY_MOCK = `http://127.0.0.1:${String(CALENDLY_MOCK_PORT)}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.(spec|e2e)\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /*
   * Four browser projects share one Next server. At the default (half the cores)
   * the browsers themselves saturate the machine and a random assertion times
   * out roughly one run in four. Two workers measured 6/6 clean and costs about
   * ten seconds.
   *
   * This is contention, not a product defect — the one genuine bug this
   * flakiness was hiding (typing before hydration) is fixed in booking.spec.ts.
   */
  workers: 2,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  /*
   * All four projects share one Next server, so a render can occasionally take
   * longer than the 5s default under parallel load. The app itself is fine —
   * four concurrent bookings all return 201 — this just stops the suite from
   * reporting contention as a failure.
   */
  expect: { timeout: 10_000 },
  /*
   * Times are rendered in the visitor's own zone. Pinning the browser to the
   * business's zone makes "3:00 PM" a stable assertion on any machine.
   */
  use: { baseURL, trace: "on-first-retry", timezoneId: "America/Chicago", locale: "en-US" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "laptop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 800 } },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 900 } },
    },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: [
    {
      command: "node tests/mocks/calendly-api.mjs",
      url: `${CALENDLY_MOCK}/health`,
      env: { CALENDLY_MOCK_PORT: String(CALENDLY_MOCK_PORT) },
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: `npm run build && npm run start -- --port ${String(PORT)}`,
      url: baseURL,
      // Read at request time by the availability route, so `start` is what needs them.
      env: { CALENDLY_TOKEN: "e2e-token", CALENDLY_API_BASE: CALENDLY_MOCK },
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
});
