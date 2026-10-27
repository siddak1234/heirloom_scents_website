"use client";

import { format, parseISO } from "date-fns";
import { BOOKING_COPY } from "@/content/pages";
import { cn } from "@/lib/cn";
import type { OpenTime } from "../schema";
import { formatTime, timeZoneName } from "../lib/schedule";

/** Past this many times, two columns keep the list from outrunning the calendar. */
const SINGLE_COLUMN_MAX = 6;

/**
 * The open times on the chosen day, exactly as Calendly reported them — the
 * hours, spacing and buffers are set in Calendly, so this list changes when
 * they do. Only open times are listed; a taken time simply is not there.
 */
export function SlotPicker({
  date,
  times,
  value,
  onChange,
}: {
  readonly date: string;
  readonly times: readonly OpenTime[];
  readonly value: string;
  readonly onChange: (start: string) => void;
}) {
  const hint = date ? format(parseISO(date), "EEEE, MMM d") : BOOKING_COPY.timeHintEmpty;

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-[9px] text-caption-sm tracking-field text-ink/70">
        {`${BOOKING_COPY.timeLabel} · ${hint}`}
      </legend>
      {date ? (
        <>
          <div
            className={cn(
              "gap-[10px]",
              times.length > SINGLE_COLUMN_MAX ? "grid grid-cols-2" : "flex flex-col",
            )}
          >
            {times.map((time) => {
              const selected = value === time.start;
              return (
                <button
                  key={time.start}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(time.start);
                  }}
                  className={cn(
                    "tnum cursor-pointer border px-4 py-[13px] text-center font-body text-body-sm text-ink transition-colors duration-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    selected ? "border-accent bg-accent/16" : "border-divider hover:border-accent",
                  )}
                >
                  {formatTime(time.start)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-label-md text-ink/65">{`Times in ${timeZoneName()}`}</p>
        </>
      ) : (
        <p className="border border-dashed border-divider px-4 py-[13px] text-center text-body-sm text-ink/65">
          {BOOKING_COPY.timePlaceholder}
        </p>
      )}
    </fieldset>
  );
}
