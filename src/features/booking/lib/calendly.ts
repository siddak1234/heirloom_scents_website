import { z } from "zod";
import type { AnswerKeys, OpenTime } from "../schema";
import { CALENDLY_ORIGIN } from "./calendly-widget";

/*
 * The pure half of the Calendly integration: response shapes, and the rules
 * that turn them into what the booking form needs. No token, no network —
 * `calendly-api.ts` does the fetching, and is server-only.
 *
 * Only the fields this site reads are validated. Calendly's responses carry
 * many more, and an unrelated addition on their side must not break booking.
 */

export const currentUserSchema = z.object({ resource: z.object({ uri: z.string() }) });

const customQuestionSchema = z.object({
  name: z.string(),
  position: z.number().int(),
  enabled: z.boolean(),
});

export const eventTypesSchema = z.object({
  collection: z.array(
    z.object({
      uri: z.string(),
      name: z.string().nullable(),
      slug: z.string().nullable(),
      duration: z.number().int().positive(),
      custom_questions: z.array(customQuestionSchema),
    }),
  ),
});

export type EventType = z.infer<typeof eventTypesSchema>["collection"][number];

export const availableTimesSchema = z.object({
  collection: z.array(
    z.object({
      status: z.string(),
      invitees_remaining: z.number(),
      start_time: z.string(),
      scheduling_url: z.string(),
    }),
  ),
});

type AvailableTime = z.infer<typeof availableTimesSchema>["collection"][number];

/**
 * The question names the site recognises, after normalising case and
 * punctuation. Matched by name rather than by position, so the questions can be
 * reordered in Calendly without touching this site. docs/DEPLOYMENT.md lists
 * the names to use.
 */
const QUESTION_NAMES = {
  phone: ["phone number", "phone"],
  occasion: ["occasion", "the occasion"],
  notes: ["anything else we should know", "notes"],
} as const satisfies Record<keyof AnswerKeys, readonly string[]>;

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Maps each answer to its Calendly pre-fill slot. Calendly numbers the slots
 * `a1`, `a2`… in the order its custom questions appear on the booking form,
 * after name and email — so hidden questions are skipped before counting.
 */
export function answerKeysFor(questions: readonly z.infer<typeof customQuestionSchema>[]) {
  const shown = questions.filter((q) => q.enabled).sort((a, b) => a.position - b.position);
  const keyFor = (names: readonly string[]) => {
    const index = shown.findIndex((q) => names.includes(normalise(q.name)));
    return index === -1 ? null : `a${String(index + 1)}`;
  };
  return {
    phone: keyFor(QUESTION_NAMES.phone),
    occasion: keyFor(QUESTION_NAMES.occasion),
    notes: keyFor(QUESTION_NAMES.notes),
  } satisfies AnswerKeys;
}

/**
 * Picks the event type to book. The free plan allows one active event type, so
 * normally there is exactly one; `slug` disambiguates if a paid plan ever adds
 * more. Throws with the names it found, because the fix is a settings change.
 */
export function pickEventType(types: readonly EventType[], slug: string | undefined): EventType {
  if (slug) {
    const match = types.find((t) => t.slug === slug);
    if (!match) throw new Error(`No active Calendly event type has the slug "${slug}"`);
    return match;
  }
  const [only, ...rest] = types;
  if (!only) throw new Error("Calendly has no active event type");
  if (rest.length) {
    const names = types.map((t) => t.slug ?? t.name ?? t.uri).join(", ");
    throw new Error(
      `Calendly has ${String(types.length)} active event types (${names}); set CALENDLY_EVENT_SLUG to choose one`,
    );
  }
  return only;
}

/**
 * True when a month is one the calendar can show: from this month through
 * MAX_MONTHS_AHEAD. Reckoned in UTC with a month of slack at the start, because
 * the visitor's "this month" can still be UTC's last month for a few hours.
 */
export function isMonthInReach(month: string, now: Date, maxMonthsAhead: number): boolean {
  const [year = 0, monthNumber = 0] = month.split("-").map(Number);
  const index = year * 12 + (monthNumber - 1);
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return (
    monthNumber >= 1 &&
    monthNumber <= 12 &&
    index >= current - 1 &&
    index <= current + maxMonthsAhead
  );
}

const DAY_MS = 86_400_000;
/** Calendly refuses a start in the past; leave headroom for the round trip. */
const LEAD_MS = 60_000;
/** Calendly's limit is 31 days per request. One under, so a boundary is never in question. */
const MAX_SPAN_MS = 30 * DAY_MS;

/**
 * The UTC span to ask Calendly about for one calendar month.
 *
 * The visitor sees the month in their own time zone, which can begin up to 14
 * hours either side of UTC's — so the span is padded a day at each end and the
 * browser groups the times into its own days. Null when the month is over.
 */
export function monthWindow(month: string, now: Date): { start: Date; end: Date } | null {
  const [year = 0, monthNumber = 0] = month.split("-").map(Number);
  const start = Math.max(Date.UTC(year, monthNumber - 1, 1) - DAY_MS, now.getTime() + LEAD_MS);
  const end = Date.UTC(year, monthNumber, 1) + DAY_MS;
  return start < end ? { start: new Date(start), end: new Date(end) } : null;
}

/** Splits a span into consecutive pieces Calendly accepts in one request. */
export function chunkWindow(window: { start: Date; end: Date }): { start: Date; end: Date }[] {
  const chunks: { start: Date; end: Date }[] = [];
  for (let from = window.start.getTime(); from < window.end.getTime(); from += MAX_SPAN_MS) {
    chunks.push({
      start: new Date(from),
      end: new Date(Math.min(from + MAX_SPAN_MS, window.end.getTime())),
    });
  }
  return chunks;
}

/**
 * Bookable times, earliest first. Keeps only slots that still take an invitee,
 * drops duplicates where two request windows meet, and refuses any link that
 * does not point at Calendly — that URL is opened in an iframe on our page.
 */
export function toOpenTimes(times: readonly AvailableTime[]): OpenTime[] {
  const seen = new Map<string, OpenTime>();
  for (const t of times) {
    if (t.status !== "available" || t.invitees_remaining < 1) continue;
    const startMs = Date.parse(t.start_time);
    if (Number.isNaN(startMs) || !URL.canParse(t.scheduling_url)) continue;
    if (new URL(t.scheduling_url).origin !== CALENDLY_ORIGIN) continue;
    const start = new Date(startMs).toISOString();
    if (!seen.has(start)) seen.set(start, { start, url: t.scheduling_url });
  }
  return [...seen.values()].sort((a, b) => a.start.localeCompare(b.start));
}
