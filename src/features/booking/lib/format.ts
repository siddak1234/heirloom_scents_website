import { format, parseISO } from "date-fns";
import type { Slot } from "../schema";

/**
 * Renders a booking as a human sentence: "Tuesday, September 15, 2026 · 3:00 PM (30 min)".
 *
 * Deliberately its own module. It is needed by the client confirmation screen
 * AND by the server-side emails; living in notify.ts would drag the `ics`
 * calendar library into the browser bundle through that one import.
 */
export function formatWhen(date: string, slot: Slot): string {
  return `${format(parseISO(date), "EEEE, MMMM d, yyyy")} · ${slot} (30 min)`;
}
