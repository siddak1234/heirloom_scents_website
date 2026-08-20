import { createEvent, type EventAttributes } from "ics";
import { parseISO } from "date-fns";
import { SITE } from "@/content/site";
import type { Slot } from "../schema";

const CONSULTATION_MINUTES = 30;

/** "3:00 PM" → [15, 0] */
function parseSlot(slot: Slot): [number, number] {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(slot);
  if (!match?.[1] || !match[2] || !match[3]) throw new Error(`Unparseable slot: ${slot}`);
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return [hour, Number(match[2])];
}

export function buildConsultationIcs(input: {
  name: string;
  email: string;
  occasion: string;
  date: string;
  slot: Slot;
  reference: string;
}): string {
  const day = parseISO(input.date);
  const [hour, minute] = parseSlot(input.slot);

  const event: EventAttributes = {
    start: [day.getFullYear(), day.getMonth() + 1, day.getDate(), hour, minute],
    /*
     * Floating local time, deliberately.
     *
     * The default emits UTC converted from the *server's* timezone. On Vercel
     * that is UTC, so a 3:00 PM slot would arrive in the guest's calendar as
     * 3:00 PM UTC — ten in the morning in Dallas. Floating time carries the
     * wall-clock time the guest actually picked and is independent of wherever
     * the render happened.
     *
     * See docs/DEPLOYMENT.md: pinning this to America/Chicago with a real
     * VTIMEZONE block is worth doing once the booking backend lands.
     */
    startInputType: "local",
    startOutputType: "local",
    duration: { minutes: CONSULTATION_MINUTES },
    title: `${SITE.name} consultation — ${input.occasion}`,
    description: `A 30-minute consultation with ${SITE.name}. Reference ${input.reference}.`,
    location: "Video or phone",
    organizer: { name: SITE.name, email: SITE.hostEmail },
    attendees: [
      { name: input.name, email: input.email, rsvp: true },
      { name: `${SITE.name} host`, email: SITE.hostEmail },
    ],
    productId: "heirloom-scents/booking",
    uid: `${input.reference}@heirloomscents.com`,
    status: "CONFIRMED",
  };

  const { error, value } = createEvent(event);
  if (error || !value) throw error ?? new Error("Failed to build calendar invite");
  return value;
}
