"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth } from "date-fns";
import { Button, Field, Input, Select } from "@/components/primitives";
import { BOOKING_COPY, OCCASIONS } from "@/content/pages";
import {
  availabilityResponseSchema,
  bookingFormSchema,
  bookingResultSchema,
  type BookingFormValues,
  type BookingResult,
  type Slot,
} from "../schema";
import { AvailabilityCalendar } from "./availability-calendar";
import { SlotPicker } from "./slot-picker";

export function BookingForm({ onBooked }: { readonly onBooked: (r: BookingResult) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [closedDates, setClosedDates] = useState<readonly string[]>([]);
  const [takenSlots, setTakenSlots] = useState<Record<string, Slot[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { name: "", email: "", occasion: "Wedding", date: "", slot: "", company: "" },
    mode: "onSubmit",
  });

  // useWatch rather than watch(): watch() returns a fresh function each render,
  // which React Compiler cannot memoize safely.
  const date = useWatch({ control, name: "date" });
  const slot = useWatch({ control, name: "slot" });

  // Availability for whichever month the visitor is looking at.
  useEffect(() => {
    const key = format(month, "yyyy-MM");
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(`/api/availability?month=${key}`, { signal: controller.signal });
        if (!res.ok) return;
        const parsed = availabilityResponseSchema.safeParse(await res.json());
        if (!parsed.success) return;
        setClosedDates(parsed.data.closedDates);
        setTakenSlots(parsed.data.takenSlots);
      } catch {
        /* aborted or offline — the server re-validates on submit regardless */
      }
    })();
    return () => {
      controller.abort();
    };
  }, [month]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Something went wrong. Please try again.";
        setSubmitError(message);
        return;
      }
      const parsed = bookingResultSchema.safeParse(await res.json());
      if (!parsed.success) {
        setSubmitError("Something went wrong. Please try again.");
        return;
      }
      onBooked(parsed.data);
    } catch {
      setSubmitError("We couldn’t reach the server. Please try again.");
    }
  });

  const dateOrSlotError = errors.date?.message ?? errors.slot?.message;

  return (
    <form
      onSubmit={(e) => {
        void onSubmit(e);
      }}
      noValidate
      className="flex flex-col"
    >
      <div className="grid gap-5 desk:grid-cols-2">
        <Field label="Your name" error={errors.name?.message}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="text"
              autoComplete="name"
              placeholder="Full name"
              aria-invalid={Boolean(errors.name)}
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
              {...register("name")}
            />
          )}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              aria-invalid={Boolean(errors.email)}
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
              {...register("email")}
            />
          )}
        </Field>
      </div>

      <Field label="The occasion" className="mt-[22px]" error={errors.occasion?.message}>
        {({ id }) => (
          <Select id={id} {...register("occasion")}>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {/* Honeypot — visually and programmatically hidden from real visitors. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="company-hp">Company</label>
        <input id="company-hp" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mt-6.5 grid items-start gap-7 desk:grid-cols-[1.25fr_1fr]">
        <AvailabilityCalendar
          value={date}
          onChange={(iso) => {
            setValue("date", iso, { shouldValidate: false });
            setValue("slot", "", { shouldValidate: false });
          }}
          closedDates={closedDates}
          month={month}
          onMonthChange={setMonth}
        />
        <SlotPicker
          date={date}
          value={slot}
          taken={date ? (takenSlots[date] ?? []) : []}
          onChange={(s) => {
            setValue("slot", s, { shouldValidate: false });
          }}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="px-11 py-4 tracking-link"
        >
          {isSubmitting ? "Reserving…" : BOOKING_COPY.submitLabel}
        </Button>
        {(dateOrSlotError ?? submitError) ? (
          <p role="alert" className="text-caption text-accent-800">
            {submitError ?? dateOrSlotError}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-caption-sm text-ink/65">{BOOKING_COPY.disclaimer}</p>
    </form>
  );
}
