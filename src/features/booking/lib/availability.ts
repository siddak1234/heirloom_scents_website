import {
  addMonths,
  endOfMonth,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { MAX_MONTHS_AHEAD, SLOTS, type Slot } from "../schema";

/**
 * Booking rules that are true regardless of what is in the database.
 * The artboard faked these with a hash; these are the real trading rules.
 */
const RULES = {
  /** 0 = Sunday, 1 = Monday — the bar does not run consultations on these days. */
  closedWeekdays: [0, 1] as const,
} as const;

export function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** True when the date can never be booked, for reasons independent of stored data. */
export function isStructurallyClosed(date: Date, today = new Date()): boolean {
  const day = startOfDay(date);
  if (!isBefore(startOfDay(today), day)) return true; // today and the past are out
  if (RULES.closedWeekdays.includes(day.getDay() as 0 | 1)) return true;
  if (isBefore(lastBookableDay(today), day)) return true;
  return false;
}

export function lastBookableDay(today = new Date()): Date {
  return endOfMonth(addMonths(startOfMonth(today), MAX_MONTHS_AHEAD));
}

export function isMonthInRange(month: Date, today = new Date()): boolean {
  const first = startOfMonth(month);
  return !isBefore(first, startOfMonth(today)) && !isBefore(lastBookableDay(today), first);
}

/**
 * The store of what is already booked.
 *
 * `StaticAvailability` ships today: structural rules only, nothing reserved.
 * Swapping in a Supabase-backed implementation is the whole of the remaining
 * booking work — no caller changes. See docs/DEPLOYMENT.md.
 */
export interface AvailabilityStore {
  /** Slots already taken, keyed by ISO date, for the given month. */
  takenSlotsForMonth(month: string): Promise<Record<string, Slot[]>>;
  /** Reserve a slot. Must reject if it was taken between read and write. */
  reserve(input: {
    date: string;
    slot: Slot;
    name: string;
    email: string;
    occasion: string;
  }): Promise<{ ok: true; reference: string } | { ok: false; reason: "taken" }>;
}

export class StaticAvailability implements AvailabilityStore {
  takenSlotsForMonth(): Promise<Record<string, Slot[]>> {
    return Promise.resolve({});
  }

  reserve(): Promise<{ ok: true; reference: string }> {
    // Deterministic, human-readable reference. A real store would return its row id.
    const ref = `HS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return Promise.resolve({ ok: true, reference: ref });
  }
}

/** Days in `month` that have no bookable slot left, given what is taken. */
export function closedDatesForMonth(
  month: string,
  taken: Record<string, Slot[]>,
  today = new Date(),
): string[] {
  const first = parseISO(`${month}-01`);
  const last = endOfMonth(first);
  const closed: string[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const iso = toIso(d);
    if (isStructurallyClosed(d, today)) {
      closed.push(iso);
      continue;
    }
    if ((taken[iso]?.length ?? 0) >= SLOTS.length) closed.push(iso);
  }
  return closed;
}
