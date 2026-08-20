import { z } from "zod";
import { OCCASIONS } from "@/content/pages";

/** Time slots offered for the 30-minute consultation. */
export const SLOTS = ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"] as const;
export type Slot = (typeof SLOTS)[number];

/** How far ahead the calendar may be navigated, in whole months. */
export const MAX_MONTHS_AHEAD = 3;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

/**
 * Shared between the client form and the route handler, so a payload that
 * satisfies the browser cannot fail differently on the server.
 */
export const bookingRequestSchema = z.object({
  name: z.string().trim().min(1, "Add your name.").max(120),
  email: z
    .string()
    .trim()
    .min(1, "Add your email.")
    .pipe(z.email("That email doesn’t look right.")),
  occasion: z.enum(OCCASIONS),
  date: isoDate,
  slot: z.enum(SLOTS),
  /**
   * Anti-spam honeypot. Deliberately NOT constrained here: the route handler
   * inspects it and answers 200 so a bot cannot tell it was rejected. A schema
   * constraint would return 422 and hand the bot a signal.
   */
  company: z.string().optional(),
});

/** What the form itself holds — date and slot start empty and are validated on submit. */
export const bookingFormSchema = bookingRequestSchema
  .extend({
    date: isoDate.or(z.literal("")),
    slot: z.enum(SLOTS).or(z.literal("")),
  })
  .refine((v) => v.date !== "", { message: "Pick a day and time.", path: ["date"] })
  .refine((v) => v.slot !== "", { message: "Pick a day and time.", path: ["slot"] });

export type BookingFormValues = z.input<typeof bookingFormSchema>;

export const availabilityResponseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  /** Days in this month with no bookable slot left. */
  closedDates: z.array(isoDate),
  /** date -> slots already taken. */
  takenSlots: z.record(isoDate, z.array(z.enum(SLOTS))),
});

export const bookingResultSchema = z.object({
  ok: z.literal(true),
  reference: z.string(),
  name: z.string(),
  email: z.string(),
  occasion: z.enum(OCCASIONS),
  date: isoDate,
  slot: z.enum(SLOTS),
});

export type BookingResult = z.infer<typeof bookingResultSchema>;
