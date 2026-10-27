/**
 * A stand-in for the three Calendly API endpoints the site reads, for the
 * end-to-end suite. Playwright starts it and points the Next server at it with
 * CALENDLY_API_BASE, so the suite exercises the real route handler, the real
 * parsing and the real form without a Calendly account or network access.
 *
 * It enforces the constraints the real API enforces — a bearer token, a start
 * time in the future, at most 31 days per request — so a regression in how the
 * site asks is caught here rather than in production.
 *
 * The schedule it serves, in America/Chicago:
 *   Tue, Wed, Fri, Sat   10:00, 12:30, 15:00, 17:30
 *   Thursday             fully booked — no times
 *   Sunday, Monday       closed
 *   anything within 24 hours of now is excluded (minimum notice)
 */
import { createServer } from "node:http";

const PORT = Number(process.env.CALENDLY_MOCK_PORT ?? 3101);
const TOKEN = process.env.CALENDLY_MOCK_TOKEN ?? "e2e-token";
const BASE = `http://127.0.0.1:${String(PORT)}`;
const TIME_ZONE = "America/Chicago";
const EVENT_TYPE = `${BASE}/event_types/E2E`;
const SCHEDULING_URL = "https://calendly.com/heirloom-e2e/consultation";
const SLOTS = [
  [10, 0],
  [12, 30],
  [15, 0],
  [17, 30],
];
const OPEN_WEEKDAYS = new Set([2, 3, 5, 6]);
const DAY_MS = 86_400_000;
const NOTICE_MS = DAY_MS;

const zoneParts = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** The zone's offset from UTC at an instant, in milliseconds (negative for Chicago). */
function offsetAt(ms) {
  const parts = Object.fromEntries(
    zoneParts.formatToParts(new Date(ms)).map((p) => [p.type, Number(p.value)]),
  );
  return (
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - ms
  );
}

/** A Chicago wall-clock time as a UTC instant. Two passes settle DST edges. */
function zonedToUtc(year, month, day, hour, minute) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const first = wall - offsetAt(wall);
  return wall - offsetAt(first);
}

function availableTimes(startMs, endMs, nowMs) {
  const times = [];
  const from = new Date(startMs - DAY_MS);
  for (
    let d = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
    d <= endMs + DAY_MS;
    d += DAY_MS
  ) {
    const date = new Date(d);
    if (!OPEN_WEEKDAYS.has(date.getUTCDay())) continue;
    for (const [hour, minute] of SLOTS) {
      const at = zonedToUtc(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        hour,
        minute,
      );
      if (at < startMs || at >= endMs || at < nowMs + NOTICE_MS) continue;
      const iso = new Date(at).toISOString();
      times.push({
        status: "available",
        invitees_remaining: 1,
        start_time: iso,
        scheduling_url: `${SCHEDULING_URL}/${iso}`,
      });
    }
  }
  return times;
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const invalid = (res, message) => send(res, 400, { title: "Invalid Argument", message });

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", BASE);
  if (url.pathname === "/health") return send(res, 200, { ok: true });
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return send(res, 401, { title: "Unauthenticated", message: "The access token is invalid" });
  }

  if (url.pathname === "/users/me") {
    return send(res, 200, {
      resource: { uri: `${BASE}/users/E2E`, name: "Heirloom Scents", timezone: TIME_ZONE },
    });
  }

  if (url.pathname === "/event_types") {
    if (url.searchParams.get("user") !== `${BASE}/users/E2E`)
      return invalid(res, "user is required");
    return send(res, 200, {
      collection: [
        {
          uri: EVENT_TYPE,
          name: "Heirloom Scents consultation",
          slug: "consultation",
          active: true,
          duration: 30,
          scheduling_url: SCHEDULING_URL,
          custom_questions: [
            {
              name: "Phone number",
              type: "phone_number",
              position: 0,
              enabled: true,
              required: true,
              answer_choices: [],
              include_other: false,
            },
            {
              name: "Occasion",
              type: "string",
              position: 1,
              enabled: true,
              required: true,
              answer_choices: [],
              include_other: false,
            },
            {
              name: "Anything else we should know?",
              type: "text",
              position: 2,
              enabled: true,
              required: false,
              answer_choices: [],
              include_other: false,
            },
          ],
        },
      ],
      pagination: { count: 1, next_page: null, previous_page: null },
    });
  }

  if (url.pathname === "/event_type_available_times") {
    if (url.searchParams.get("event_type") !== EVENT_TYPE)
      return invalid(res, "Unknown event type");
    const start = Date.parse(url.searchParams.get("start_time") ?? "");
    const end = Date.parse(url.searchParams.get("end_time") ?? "");
    const now = Date.now();
    if (Number.isNaN(start) || Number.isNaN(end))
      return invalid(res, "start_time and end_time are required");
    if (start < now) return invalid(res, "start_time must be in the future");
    if (end <= start) return invalid(res, "end_time must be after start_time");
    if (end - start > 31 * DAY_MS)
      return invalid(res, "The date range can be no greater than 31 days");
    return send(res, 200, { collection: availableTimes(start, end, now) });
  }

  return send(res, 404, { title: "Resource Not Found", message: url.pathname });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`calendly mock on ${BASE}`);
});
