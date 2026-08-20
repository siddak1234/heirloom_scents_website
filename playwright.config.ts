import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${String(PORT)}`;

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
  use: { baseURL, trace: "on-first-retry" },
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
  webServer: {
    command: `npm run build && npm run start -- --port ${String(PORT)}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
