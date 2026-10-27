import { format } from "date-fns";
import { OCCASION_OTHER } from "@/content/pages";
import type { AnswerKeys, BookingFormValues, OpenTime } from "../schema";
import type { CalendlyPrefill } from "./calendly-widget";
import { toE164 } from "./phone";

/*
 * Browser-side presentation of Calendly's times. Calendly reports UTC instants;
 * everything here renders them in the visitor's own time zone — the same zone
 * Calendly's window detects and shows, so the two always agree.
 */

/** "2026-10-28" for a local calendar day. */
export function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Open times keyed by the local day they fall on. */
export function groupByLocalDay(times: readonly OpenTime[]): ReadonlyMap<string, OpenTime[]> {
  const days = new Map<string, OpenTime[]>();
  for (const time of times) {
    const day = toIso(new Date(time.start));
    const list = days.get(day);
    if (list) list.push(time);
    else days.set(day, [time]);
  }
  return days;
}

/** "3:00 PM" */
export function formatTime(start: string): string {
  return format(new Date(start), "h:mm a");
}

/** "Tuesday, October 27, 2026 · 3:00 PM (30 min)" */
export function formatWhen(start: string, durationMinutes: number): string {
  return `${format(new Date(start), "EEEE, MMMM d, yyyy")} · ${formatTime(start)} (${String(durationMinutes)} min)`;
}

/** "Central Daylight Time" — the zone the times are shown in. */
export function timeZoneName(at: Date = new Date()): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "your time zone"
  );
}

/** The occasion as Calendly receives it: "Wedding", or "Other – Graduation". */
export function occasionAnswer(values: Pick<BookingFormValues, "occasion" | "occasionOther">) {
  return values.occasion === OCCASION_OTHER
    ? `${OCCASION_OTHER} – ${values.occasionOther.trim()}`
    : values.occasion;
}

/**
 * The answers to hand Calendly's window.
 *
 * Each answer goes to its own Calendly question when the event type has one.
 * One that does not — the occasion or the phone — is written into the notes
 * question instead, labelled and ahead of the guest's own notes, so it still
 * reaches the host's booking email:
 *
 *   Occasion: Other – Graduation
 *   Phone: +12145550123
 *
 *   About 120 guests.
 *
 * Only when there is no notes question either is an answer dropped.
 */
export function calendlyPrefill(values: BookingFormValues, keys: AnswerKeys): CalendlyPrefill {
  const answers: Record<string, string> = {};
  const carried: string[] = [];

  const occasion = occasionAnswer(values);
  if (keys.occasion) answers[keys.occasion] = occasion;
  else carried.push(`Occasion: ${occasion}`);

  const phone = toE164(values.phone);
  if (phone) {
    if (keys.phone) answers[keys.phone] = phone;
    else carried.push(`Phone: ${phone}`);
  }

  if (keys.notes) {
    const notes = [carried.join("\n"), values.notes.trim()].filter(Boolean).join("\n\n");
    if (notes) answers[keys.notes] = notes;
  }
  return { name: values.name.trim(), email: values.email.trim(), customAnswers: answers };
}
