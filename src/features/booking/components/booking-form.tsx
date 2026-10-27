"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth } from "date-fns";
import { ArrowLink, Button, Field, Input, Select, Textarea } from "@/components/primitives";
import { BOOKING_COPY, OCCASION_OTHER, OCCASIONS } from "@/content/pages";
import { SITE } from "@/content/site";
import {
  availabilityResponseSchema,
  bookingFormSchema,
  type Availability,
  type BookingFormValues,
  type BookingResult,
} from "../schema";
import { calendlyEventName, loadCalendly } from "../lib/calendly-widget";
import { calendlyPrefill, groupByLocalDay, occasionAnswer } from "../lib/schedule";
import { AvailabilityCalendar } from "./availability-calendar";
import { SlotPicker } from "./slot-picker";

type MonthState = Availability | "error";

const INSTAGRAM_URL = `https://www.instagram.com/${SITE.instagram.replace("@", "")}`;

/**
 * The booking form, on live Calendly availability.
 *
 * The calendar and times come from `/api/availability`, which reads Calendly.
 * Reserve validates here, then opens Calendly's own window at the chosen time
 * with every answer already filled in; the guest confirms there, and Calendly
 * books it, writes it to the host's calendar and emails both sides. Calendly
 * tells this page when that has happened, and only then is the confirmation
 * screen shown.
 */
export function BookingForm({ onBooked }: { readonly onBooked: (r: BookingResult) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [months, setMonths] = useState<Readonly<Record<string, MonthState>>>({});
  const [attempt, setAttempt] = useState(0);
  const [unconfigured, setUnconfigured] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  /** The booking handed to Calendly's window and not yet confirmed there. */
  const [pending, setPending] = useState<BookingResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      occasion: "Wedding",
      occasionOther: "",
      notes: "",
      date: "",
      start: "",
    },
    mode: "onSubmit",
  });

  // useWatch rather than watch(): watch() returns a fresh function each render,
  // which React Compiler cannot memoize safely.
  const date = useWatch({ control, name: "date" });
  const start = useWatch({ control, name: "start" });
  const occasion = useWatch({ control, name: "occasion" });

  const monthKey = format(month, "yyyy-MM");

  // Live availability for whichever month is on screen. Refetched on every
  // visit to a month, so returning to one never shows times that have gone.
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(`/api/availability?month=${monthKey}`, {
          signal: controller.signal,
        });
        if (res.status === 503) {
          setUnconfigured(true);
          return;
        }
        const parsed = res.ok ? availabilityResponseSchema.safeParse(await res.json()) : null;
        setMonths((prev) => {
          if (parsed?.success) return { ...prev, [monthKey]: parsed.data };
          // A failed refresh does not throw away times already on screen.
          const known = prev[monthKey];
          return known && known !== "error" ? prev : { ...prev, [monthKey]: "error" };
        });
      } catch {
        if (!controller.signal.aborted) {
          setMonths((prev) => (prev[monthKey] ? prev : { ...prev, [monthKey]: "error" }));
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, [monthKey, attempt]);

  // Calendly's window reports the booking by postMessage. Only its origin is
  // trusted, and only while this page has a booking waiting on it.
  useEffect(() => {
    if (!pending) return;
    // The guest can go back inside Calendly's window and pick another time.
    // If they do, the time we opened it at is no longer the one booked.
    let timeChanged = false;
    function onMessage(event: MessageEvent) {
      const name = calendlyEventName(event);
      if (name === "calendly.date_and_time_selected") timeChanged = true;
      if (name === "calendly.event_scheduled" && pending) {
        window.Calendly?.closePopupWidget();
        setPending(null);
        onBooked(timeChanged ? { ...pending, start: null } : pending);
      }
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [pending, onBooked]);

  const shown = months[monthKey];
  const shownDays = shown && shown !== "error" ? groupByLocalDay(shown.times) : null;
  const openDays = shownDays ? new Set(shownDays.keys()) : null;
  const monthHasOpenings = [...(openDays ?? [])].some((d) => d.startsWith(monthKey));

  // The chosen day's times come from the month it belongs to, which stays
  // loaded while the visitor browses other months.
  const chosen = date ? months[date.slice(0, 7)] : undefined;
  const chosenAvailability = chosen && chosen !== "error" ? chosen : null;
  const dayTimes = chosenAvailability
    ? (groupByLocalDay(chosenAvailability.times).get(date) ?? [])
    : [];

  const retry = () => {
    setMonths((prev) => {
      const { [monthKey]: _failed, ...rest } = prev;
      return rest;
    });
    setAttempt((n) => n + 1);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const time = dayTimes.find((t) => t.start === values.start);
    if (!chosenAvailability || !time) {
      setValue("start", "");
      setSubmitError(BOOKING_COPY.timeGone);
      return;
    }
    setOpening(true);
    try {
      const calendly = await loadCalendly();
      calendly.initPopupWidget({
        url: time.url,
        prefill: calendlyPrefill(values, chosenAvailability.answerKeys),
      });
      setPending({
        name: values.name.trim(),
        email: values.email.trim(),
        occasion: occasionAnswer(values),
        start: time.start,
        durationMinutes: chosenAvailability.durationMinutes,
      });
    } catch {
      setSubmitError(BOOKING_COPY.widgetError);
    } finally {
      setOpening(false);
    }
  });

  if (unconfigured) {
    return (
      <div className="border border-divider px-8 py-10">
        <p className="text-body-md/[1.8] text-ink/78">{BOOKING_COPY.unconfigured}</p>
        <ArrowLink href={INSTAGRAM_URL} className="mt-6">
          Message us on Instagram
        </ArrowLink>
      </div>
    );
  }

  const calendarNote =
    shown === undefined ? (
      BOOKING_COPY.calendarLoading
    ) : shown === "error" ? (
      <>
        {`${BOOKING_COPY.loadError} `}
        <button
          type="button"
          onClick={retry}
          className="cursor-pointer border-0 bg-transparent p-0 text-accent-800 underline underline-offset-2"
        >
          {BOOKING_COPY.retry}
        </button>
      </>
    ) : monthHasOpenings ? (
      BOOKING_COPY.calendarNote
    ) : (
      BOOKING_COPY.monthEmpty
    );

  return (
    <form
      onSubmit={(e) => {
        void onSubmit(e);
      }}
      noValidate
      className="flex flex-col"
    >
      <div className="grid gap-x-5 gap-y-[22px] desk:grid-cols-2">
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
        <Field label="Phone" error={errors.phone?.message}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(214) 555-0123"
              aria-invalid={Boolean(errors.phone)}
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
              {...register("phone")}
            />
          )}
        </Field>
        <Field label="The occasion" error={errors.occasion?.message}>
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
      </div>

      {occasion === OCCASION_OTHER ? (
        <Field label="Your occasion" className="mt-[22px]" error={errors.occasionOther?.message}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="text"
              maxLength={80}
              placeholder="Graduation, baby shower, anniversary…"
              aria-invalid={Boolean(errors.occasionOther)}
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
              {...register("occasionOther")}
            />
          )}
        </Field>
      ) : null}

      <div className="mt-6.5 grid items-start gap-7 desk:grid-cols-[1.25fr_1fr]">
        <AvailabilityCalendar
          value={date}
          onChange={(iso) => {
            setValue("date", iso, { shouldValidate: false });
            setValue("start", "", { shouldValidate: false });
          }}
          openDays={openDays}
          month={month}
          onMonthChange={setMonth}
          note={calendarNote}
        />
        <SlotPicker
          date={date}
          times={dayTimes}
          value={start}
          onChange={(s) => {
            setValue("start", s, { shouldValidate: false });
            setSubmitError(null);
            // Intent is clear: fetch Calendly's script now so Reserve opens instantly.
            loadCalendly().catch(() => undefined);
          }}
        />
      </div>

      <Field
        label="Anything else we should know? (optional)"
        className="mt-7"
        error={errors.notes?.message}
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            rows={3}
            maxLength={1000}
            placeholder="Guest count, venue, a scent you already love…"
            aria-invalid={Boolean(errors.notes)}
            {...(describedBy ? { "aria-describedby": describedBy } : {})}
            {...register("notes")}
          />
        )}
      </Field>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={opening}
          className="px-11 py-4 tracking-link"
        >
          {opening ? BOOKING_COPY.submitOpening : BOOKING_COPY.submitLabel}
        </Button>
        {(submitError ?? errors.start?.message) ? (
          <p role="alert" className="text-caption text-accent-800">
            {submitError ?? errors.start?.message}
          </p>
        ) : null}
      </div>

      {pending ? (
        <p role="status" className="mt-4 text-caption text-ink/78">
          {BOOKING_COPY.finishInCalendly}
        </p>
      ) : null}

      <p className="mt-4 text-caption-sm text-ink/65">{BOOKING_COPY.disclaimer}</p>
    </form>
  );
}
