import { describe, expect, it } from "vitest";
import {
  answerKeysFor,
  chunkWindow,
  isMonthInReach,
  monthWindow,
  pickEventType,
  toOpenTimes,
  type EventType,
} from "@/features/booking/lib/calendly";

const DAY = 86_400_000;

describe("answerKeysFor", () => {
  const q = (name: string, position: number, enabled = true) => ({ name, position, enabled });

  it("numbers questions in the order Calendly shows them", () => {
    expect(
      answerKeysFor([
        q("Anything else we should know?", 2),
        q("Phone number", 0),
        q("Occasion", 1),
      ]),
    ).toEqual({ phone: "a1", occasion: "a2", notes: "a3" });
  });

  it("follows a reorder made in Calendly", () => {
    expect(answerKeysFor([q("Occasion", 0), q("Phone number", 1)])).toEqual({
      phone: "a2",
      occasion: "a1",
      notes: null,
    });
  });

  it("skips hidden questions before counting", () => {
    expect(answerKeysFor([q("Company", 0, false), q("Phone number", 1), q("Occasion", 2)])).toEqual(
      { phone: "a1", occasion: "a2", notes: null },
    );
  });

  it("ignores case and punctuation in the names", () => {
    expect(answerKeysFor([q("PHONE NUMBER:", 0), q("  occasion ", 1)])).toMatchObject({
      phone: "a1",
      occasion: "a2",
    });
  });

  it("reports a missing question as null rather than guessing", () => {
    expect(answerKeysFor([q("Your budget", 0)])).toEqual({
      phone: null,
      occasion: null,
      notes: null,
    });
  });
});

describe("pickEventType", () => {
  const type = (slug: string): EventType => ({
    uri: `https://api.calendly.com/event_types/${slug}`,
    name: slug,
    slug,
    duration: 30,
    custom_questions: [],
  });

  it("takes the only active event type", () => {
    expect(pickEventType([type("consultation")], undefined).slug).toBe("consultation");
  });

  it("refuses to guess between several, and names them", () => {
    expect(() => pickEventType([type("a"), type("b")], undefined)).toThrow(/a, b.*SLUG/);
  });

  it("uses the configured slug when there are several", () => {
    expect(pickEventType([type("a"), type("b")], "b").slug).toBe("b");
  });

  it("fails clearly when there is none", () => {
    expect(() => pickEventType([], undefined)).toThrow(/no active event type/);
  });
});

describe("monthWindow", () => {
  const now = new Date("2026-10-27T15:00:00Z");

  it("pads a future month by a day each side, for every time zone", () => {
    expect(monthWindow("2026-11", now)).toEqual({
      start: new Date("2026-10-31T00:00:00Z"),
      end: new Date("2026-12-02T00:00:00Z"),
    });
  });

  it("starts the current month from now, since Calendly refuses the past", () => {
    const window = monthWindow("2026-10", now);
    expect(window?.start.getTime()).toBeGreaterThan(now.getTime());
    expect(window?.end).toEqual(new Date("2026-11-02T00:00:00Z"));
  });

  it("is null for a month already over", () => {
    expect(monthWindow("2026-09", now)).toBeNull();
  });
});

describe("chunkWindow", () => {
  it("splits a padded month into requests Calendly accepts", () => {
    const start = new Date("2026-10-31T00:00:00Z");
    const end = new Date("2026-12-02T00:00:00Z");
    const chunks = chunkWindow({ start, end });
    expect(chunks.length).toBe(2);
    for (const c of chunks)
      expect(c.end.getTime() - c.start.getTime()).toBeLessThanOrEqual(31 * DAY);
    expect(chunks[0]?.start).toEqual(start);
    expect(chunks.at(-1)?.end).toEqual(end);
    expect(chunks[1]?.start).toEqual(chunks[0]?.end);
  });

  it("leaves a short span whole", () => {
    const start = new Date("2026-10-28T00:00:00Z");
    expect(chunkWindow({ start, end: new Date(start.getTime() + 3 * DAY) })).toHaveLength(1);
  });
});

describe("toOpenTimes", () => {
  const slot = (start_time: string, extra: Partial<Record<string, unknown>> = {}) => ({
    status: "available",
    invitees_remaining: 1,
    start_time,
    scheduling_url: `https://calendly.com/hs/consultation/${start_time}`,
    ...extra,
  });

  it("sorts, and drops duplicates where two request windows meet", () => {
    const times = toOpenTimes([
      slot("2026-10-30T20:00:00Z"),
      slot("2026-10-30T15:00:00.000000Z"),
      slot("2026-10-30T20:00:00.000Z"),
    ]);
    expect(times.map((t) => t.start)).toEqual([
      "2026-10-30T15:00:00.000Z",
      "2026-10-30T20:00:00.000Z",
    ]);
  });

  it("keeps only times that still take a guest", () => {
    expect(
      toOpenTimes([
        slot("2026-10-30T15:00:00Z", { status: "unavailable" }),
        slot("2026-10-30T16:00:00Z", { invitees_remaining: 0 }),
      ]),
    ).toEqual([]);
  });

  it("refuses a booking link that is not Calendly's", () => {
    expect(
      toOpenTimes([slot("2026-10-30T15:00:00Z", { scheduling_url: "https://evil.example/x" })]),
    ).toEqual([]);
  });
});

describe("isMonthInReach", () => {
  const now = new Date("2026-10-27T15:00:00Z");

  it("allows this month through six ahead", () => {
    expect(isMonthInReach("2026-10", now, 6)).toBe(true);
    expect(isMonthInReach("2027-04", now, 6)).toBe(true);
    expect(isMonthInReach("2027-05", now, 6)).toBe(false);
  });

  it("allows last month, which is still 'this month' somewhere west of UTC", () => {
    expect(isMonthInReach("2026-09", now, 6)).toBe(true);
    expect(isMonthInReach("2026-08", now, 6)).toBe(false);
  });

  it("refuses a month that does not exist", () => {
    expect(isMonthInReach("2026-13", now, 6)).toBe(false);
  });
});
