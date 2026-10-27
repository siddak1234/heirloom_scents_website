import { z } from "zod";
import { OCCASION_OTHER, OCCASIONS } from "@/content/pages";
import { toE164 } from "./lib/phone";

/**
 * How far ahead the calendar may be navigated, in whole months. This is only
 * the reach of the month arrows: which days inside it are open is Calendly's
 * date-range setting, read live.
 */
export const MAX_MONTHS_AHEAD = 6;

export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM");

/**
 * The form. There is no server submit: a valid form opens Calendly's window
 * with these answers filled in, and Calendly makes the booking.
 *
 * `date` is the local day picked on the calendar; `start` is the UTC instant of
 * the time picked inside it, exactly as Calendly reported it.
 */
export const bookingFormSchema = z
  .object({
    name: z.string().trim().min(1, "Add your name.").max(120),
    email: z
      .string()
      .trim()
      .min(1, "Add your email.")
      .pipe(z.email("That email doesn’t look right.")),
    /*
     * One check with two messages: an empty field is missing, not malformed.
     * Not `.min(1, { abort: true })` — aborting there also skips the "Other"
     * refinement below, so that error would surface only on a second submit.
     */
    phone: z
      .string()
      .trim()
      .superRefine((v, ctx) => {
        if (v === "") ctx.addIssue({ code: "custom", message: "Add your phone number." });
        else if (toE164(v) === null) {
          ctx.addIssue({
            code: "custom",
            message:
              "That number doesn’t look right. Include the country code if it’s outside the US.",
          });
        }
      }),
    occasion: z.enum(OCCASIONS),
    occasionOther: z.string().trim().max(80, "Keep it under 80 characters."),
    notes: z.string().trim().max(1000, "Keep it under 1,000 characters."),
    date: z.string(),
    start: z.string().min(1, "Pick a day and time."),
  })
  .refine((v) => v.occasion !== OCCASION_OTHER || v.occasionOther !== "", {
    message: "Tell us the occasion.",
    path: ["occasionOther"],
    /*
     * Run even when another field has failed, so an empty submission reports
     * every missing answer at once rather than revealing this one last. The
     * guard keeps it from reading a value that did not parse.
     */
    when: ({ value }) =>
      typeof value === "object" &&
      value !== null &&
      "occasion" in value &&
      "occasionOther" in value &&
      typeof value.occasionOther === "string",
  });

export type BookingFormValues = z.input<typeof bookingFormSchema>;

const answerKey = z.string().regex(/^a\d{1,2}$/);

/** What `/api/availability` returns for one month. */
export const availabilityResponseSchema = z.object({
  month: monthKeySchema,
  durationMinutes: z.number().int().positive(),
  /** Open start times as UTC instants, each with the Calendly link that books it. */
  times: z.array(z.object({ start: z.iso.datetime(), url: z.url() })),
  /**
   * Which of Calendly's pre-fill slots (`a1`–`a10`) carries each answer, read
   * from the event type's own questions. Null when the question is missing, in
   * which case the guest answers it in Calendly's window instead.
   */
  answerKeys: z.object({
    phone: answerKey.nullable(),
    occasion: answerKey.nullable(),
    notes: answerKey.nullable(),
  }),
});

export type Availability = z.infer<typeof availabilityResponseSchema>;
export type OpenTime = Availability["times"][number];
export type AnswerKeys = Availability["answerKeys"];

/** What the confirmation screen shows once Calendly reports the booking. */
export interface BookingResult {
  readonly name: string;
  readonly email: string;
  readonly occasion: string;
  /** Null when the guest changed the time inside Calendly's window. */
  readonly start: string | null;
  readonly durationMinutes: number;
}
