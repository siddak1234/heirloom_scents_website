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
 * The answers to hand Calendly's window. An answer whose question is missing
 * from the event type is left out; the guest types it there instead.
 */
export function calendlyPrefill(values: BookingFormValues, keys: AnswerKeys): CalendlyPrefill {
  const answers: Record<string, string> = {};
  const phone = toE164(values.phone);
  if (keys.phone && phone) answers[keys.phone] = phone;
  if (keys.occasion) answers[keys.occasion] = occasionAnswer(values);
  const notes = values.notes.trim();
  if (keys.notes && notes) answers[keys.notes] = notes;
  return { name: values.name.trim(), email: values.email.trim(), customAnswers: answers };
}
