"use client";

import { format, parseISO } from "date-fns";
import { BOOKING_COPY } from "@/content/pages";
import { SLOTS, type Slot } from "../schema";
import { cn } from "@/lib/cn";

export function SlotPicker({
  date,
  value,
  taken,
  onChange,
}: {
  readonly date: string;
  readonly value: string;
  readonly taken: readonly Slot[];
  readonly onChange: (slot: Slot) => void;
}) {
  const hint = date ? format(parseISO(date), "EEEE, MMM d") : BOOKING_COPY.timeHintEmpty;

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-[9px] text-caption-sm tracking-field text-ink/70">
        {`${BOOKING_COPY.timeLabel} · ${hint}`}
      </legend>
      <div className="flex flex-col gap-[10px]">
        {SLOTS.map((slot) => {
          const isTaken = taken.includes(slot);
          const disabled = !date || isTaken;
          const selected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => {
                onChange(slot);
              }}
              className={cn(
                "tnum border px-4 py-[13px] text-center font-body text-body-sm transition-colors duration-300",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected
                  ? "border-accent bg-accent/16 text-ink"
                  : disabled
                    ? "cursor-default border-divider/60 text-ink/30"
                    : "cursor-pointer border-divider text-ink hover:border-accent",
              )}
            >
              {isTaken ? `${slot} ${BOOKING_COPY.bookedSuffix}` : slot}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
