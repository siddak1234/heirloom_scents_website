import { describe, expect, it } from "vitest";
import { addDays, addMonths, nextSunday, nextTuesday, startOfMonth } from "date-fns";
import {
  closedDatesForMonth,
  isMonthInRange,
  isStructurallyClosed,
  lastBookableDay,
  toIso,
} from "@/features/booking/lib/availability";
import { SLOTS } from "@/features/booking/schema";

const TODAY = new Date(2026, 7, 20); // Thursday 20 Aug 2026

describe("isStructurallyClosed", () => {
  it("closes today and the past", () => {
    expect(isStructurallyClosed(TODAY, TODAY)).toBe(true);
    expect(isStructurallyClosed(addDays(TODAY, -1), TODAY)).toBe(true);
  });

  it("closes Sundays and Mondays", () => {
    expect(isStructurallyClosed(nextSunday(TODAY), TODAY)).toBe(true);
    expect(isStructurallyClosed(addDays(nextSunday(TODAY), 1), TODAY)).toBe(true);
  });

  it("opens an ordinary future weekday", () => {
    expect(isStructurallyClosed(nextTuesday(TODAY), TODAY)).toBe(false);
  });

  it("closes anything past the booking window", () => {
    expect(isStructurallyClosed(addDays(lastBookableDay(TODAY), 1), TODAY)).toBe(true);
  });
});

describe("isMonthInRange", () => {
  it("accepts this month and the third month ahead", () => {
    expect(isMonthInRange(startOfMonth(TODAY), TODAY)).toBe(true);
    expect(isMonthInRange(addMonths(startOfMonth(TODAY), 3), TODAY)).toBe(true);
  });

  it("rejects last month and the fourth month ahead", () => {
    expect(isMonthInRange(addMonths(startOfMonth(TODAY), -1), TODAY)).toBe(false);
    expect(isMonthInRange(addMonths(startOfMonth(TODAY), 4), TODAY)).toBe(false);
  });
});

describe("closedDatesForMonth", () => {
  it("marks every Sunday and Monday closed", () => {
    const closed = closedDatesForMonth("2026-09", {}, TODAY);
    // September 2026 has 4 Sundays and 4 Mondays.
    expect(closed).toContain("2026-09-06");
    expect(closed).toContain("2026-09-07");
    expect(closed.length).toBe(8);
  });

  it("closes a day once every slot is taken", () => {
    const target = toIso(nextTuesday(TODAY));
    const closed = closedDatesForMonth(target.slice(0, 7), { [target]: [...SLOTS] }, TODAY);
    expect(closed).toContain(target);
  });

  it("leaves a day open when only some slots are taken", () => {
    const target = toIso(nextTuesday(TODAY));
    const closed = closedDatesForMonth(target.slice(0, 7), { [target]: [SLOTS[0]] }, TODAY);
    expect(closed).not.toContain(target);
  });
});
