"use client";

import { DayPicker } from "@daypicker/react";
import { isSameDay, parseISO, startOfMonth } from "date-fns";
import { isStructurallyClosed, lastBookableDay, toIso } from "../lib/availability";
import { BOOKING_COPY } from "@/content/pages";

/**
 * The booking calendar. Styled to the artboard — square cells, accent border on
 * the selection, greyed closed days — but built on DayPicker so it has a real
 * ARIA grid and full keyboard navigation, which the artboard's button grid had
 * neither of.
 */
export function AvailabilityCalendar({
  value,
  onChange,
  closedDates,
  month,
  onMonthChange,
}: {
  readonly value: string;
  readonly onChange: (iso: string) => void;
  readonly closedDates: readonly string[];
  readonly month: Date;
  readonly onMonthChange: (month: Date) => void;
}) {
  const today = new Date();
  const closed = closedDates.map((d) => parseISO(d));
  const selected = value ? parseISO(value) : undefined;

  return (
    <div className="border border-divider p-5">
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        startMonth={startOfMonth(today)}
        endMonth={lastBookableDay(today)}
        {...(selected ? { selected } : {})}
        onSelect={(date) => {
          if (date) onChange(toIso(date));
        }}
        disabled={(date) =>
          isStructurallyClosed(date, today) || closed.some((c) => isSameDay(c, date))
        }
        showOutsideDays={false}
        classNames={{
          root: "hs-daypicker relative [&_.rdp-chevron]:size-3 [&_.rdp-chevron]:fill-current",
          months: "flex flex-col",
          month: "w-full",
          month_caption: "flex items-center justify-center pb-[14px]",
          caption_label: "font-heading text-subtitle-md font-semibold",
          nav: "flex items-center justify-between absolute inset-x-0 top-0 pointer-events-none",
          button_previous:
            "pointer-events-auto flex size-8 items-center justify-center rounded-full border border-divider text-ink transition-colors duration-300 hover:border-accent disabled:opacity-30 disabled:pointer-events-none",
          button_next:
            "pointer-events-auto flex size-8 items-center justify-center rounded-full border border-divider text-ink transition-colors duration-300 hover:border-accent disabled:opacity-30 disabled:pointer-events-none",
          month_grid: "w-full border-collapse",
          weekdays: "grid grid-cols-7 gap-[2px] pb-[6px]",
          weekday: "text-center text-label-xs tracking-meta text-ink-65 uppercase font-normal",
          week: "grid grid-cols-7 gap-[2px]",
          day: "p-0",
          day_button:
            "tnum aspect-square w-full cursor-pointer border border-transparent bg-transparent font-body text-body-xs text-ink transition-colors duration-250 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
          selected: "[&_button]:border-accent [&_button]:bg-accent/16",
          disabled:
            "[&_button]:cursor-default [&_button]:text-ink-30 [&_button]:hover:border-transparent",
          today: "[&_button]:font-semibold",
          outside: "invisible",
        }}
      />
      <p className="mt-3 text-label-sm text-ink-65">{BOOKING_COPY.calendarNote}</p>
    </div>
  );
}
