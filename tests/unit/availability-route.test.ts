// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/availability/route";

/*
 * The availability route against a stubbed fetch: what it asks Calendly, and
 * what it does when Calendly is missing, refuses, or answers.
 */

const API = "https://api.calendly.com";
const EVENT_TYPE = `${API}/event_types/HS`;

function nextMonthKey(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toISOString().slice(0, 7);
}

const request = (month: string) =>
  new Request(`https://heirloomscents.com/api/availability?month=${month}`);

function calendly(times: { start_time: string }[] = []) {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input) => {
    const url = new URL(typeof input === "string" ? input : input.toString());
    const json = (body: unknown) => Promise.resolve(Response.json(body));
    if (url.pathname === "/users/me") return json({ resource: { uri: `${API}/users/ME` } });
    if (url.pathname === "/event_types") {
      return json({
        collection: [
          {
            uri: EVENT_TYPE,
            name: "Heirloom Scents consultation",
            slug: "consultation",
            duration: 30,
            custom_questions: [
              { name: "Phone number", position: 0, enabled: true },
              { name: "Occasion", position: 1, enabled: true },
              { name: "Anything else we should know?", position: 2, enabled: true },
            ],
          },
        ],
      });
    }
    return json({
      collection: times.map((t) => ({
        status: "available",
        invitees_remaining: 1,
        start_time: t.start_time,
        scheduling_url: `https://calendly.com/hs/consultation/${t.start_time}`,
      })),
    });
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/availability", () => {
  it("says it is not configured, uncached, when there is no token", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "");
    const fetchSpy = calendly();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await GET(request(nextMonthKey()));
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("asks Calendly with the token, in windows of at most 31 days", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "pat-123");
    const fetchSpy = calendly();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await GET(request(nextMonthKey()));
    expect(res.status).toBe(200);

    const calls = fetchSpy.mock.calls.map(([input, init]) => ({
      url: new URL(String(input)),
      auth: new Headers((init as RequestInit | undefined)?.headers).get("authorization"),
    }));
    for (const call of calls) expect(call.auth).toBe("Bearer pat-123");

    const windows = calls.filter((c) => c.url.pathname === "/event_type_available_times");
    expect(windows.length).toBeGreaterThanOrEqual(2);
    for (const { url } of windows) {
      expect(url.searchParams.get("event_type")).toBe(EVENT_TYPE);
      const span =
        Date.parse(url.searchParams.get("end_time") ?? "") -
        Date.parse(url.searchParams.get("start_time") ?? "");
      expect(span).toBeLessThanOrEqual(31 * 86_400_000);
    }
  });

  it("returns the times, the duration and the pre-fill map, cached at the edge", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "pat-123");
    const month = nextMonthKey();
    vi.stubGlobal("fetch", calendly([{ start_time: `${month}-10T15:00:00Z` }]));
    const res = await GET(request(month));
    expect(res.headers.get("cache-control")).toContain("s-maxage=60");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      month,
      durationMinutes: 30,
      answerKeys: { phone: "a1", occasion: "a2", notes: "a3" },
    });
    // Two request windows overlap at their seam; the time appears once.
    expect(body.times).toEqual([
      {
        start: `${month}-10T15:00:00.000Z`,
        url: `https://calendly.com/hs/consultation/${month}-10T15:00:00Z`,
      },
    ]);
  });

  it("answers 502, uncached, when Calendly refuses the token", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "revoked");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ title: "Unauthenticated" }, { status: 401 }))),
    );
    const res = await GET(request(nextMonthKey()));
    expect(res.status).toBe(502);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("never logs the token", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "pat-secret-value");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ title: "Server Error" }, { status: 500 }))),
    );
    await GET(request(nextMonthKey()));
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).toContain("500");
    expect(logged).not.toContain("pat-secret-value");
  });

  it("refuses a malformed or out-of-reach month without calling Calendly", async () => {
    vi.stubEnv("CALENDLY_TOKEN", "pat-123");
    const fetchSpy = calendly();
    vi.stubGlobal("fetch", fetchSpy);
    expect((await GET(request("nope"))).status).toBe(400);
    expect((await GET(request("2099-01"))).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
