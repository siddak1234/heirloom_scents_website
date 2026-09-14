import { SITE } from "@/content/site";
import type { Slot } from "../schema";
import { formatWhen } from "./format";
import { buildConsultationIcs } from "./ics";

export interface ConsultationDetails {
  readonly name: string;
  readonly email: string;
  readonly occasion: string;
  readonly date: string;
  readonly slot: Slot;
  readonly reference: string;
}

/** Plain-text body. Kept dependency-free so it is trivially unit-testable. */
export function guestEmailText(d: ConsultationDetails): string {
  return [
    `Thank you, ${d.name}.`,
    "",
    `Your ${SITE.name} consultation is scheduled.`,
    "",
    `What:  ${SITE.name} consultation — ${d.occasion}`,
    `When:  ${formatWhen(d.date, d.slot)}`,
    `Who:   ${d.email} and ${SITE.hostEmail}`,
    `Ref:   ${d.reference}`,
    "",
    "A calendar invite is attached. Need a different time? Reply to this email and we’ll move it.",
    "",
    `— ${SITE.name}, ${SITE.locality}, ${SITE.region}`,
  ].join("\n");
}

export function hostEmailText(d: ConsultationDetails): string {
  return [
    `New consultation booked — ${d.reference}`,
    "",
    `Name:      ${d.name}`,
    `Email:     ${d.email}`,
    `Occasion:  ${d.occasion}`,
    `When:      ${formatWhen(d.date, d.slot)}`,
  ].join("\n");
}

/**
 * One line, machine-readable, carrying everything needed to honour a booking by
 * hand: who, what, when, and the reference the guest was shown.
 *
 * Until a transport is wired this log IS the booking record — nothing is
 * persisted and no mail is sent — so it has to be findable in Vercel's runtime
 * logs by searching `[booking]`, and complete enough to act on without the
 * guest having to be asked again.
 */
export function bookingLogLine(d: ConsultationDetails): string {
  return JSON.stringify({
    reference: d.reference,
    name: d.name,
    email: d.email,
    occasion: d.occasion,
    date: d.date,
    slot: d.slot,
  });
}

export interface Notifier {
  sendConsultationEmails(details: ConsultationDetails): Promise<void>;
}

/**
 * No transport is wired yet. The messages and the .ics attachment are fully
 * built here; connecting Resend is a single send() call per message.
 * See docs/DEPLOYMENT.md for the environment variables it needs.
 *
 * The enquiry is logged at WARN, not INFO, and says so: a booking that reaches
 * nobody is a real problem, and it should stand out against the request noise
 * rather than blend into it. The full message bodies follow at INFO so the log
 * also shows exactly what will be sent once the transport lands.
 */
export class ConsoleNotifier implements Notifier {
  sendConsultationEmails(details: ConsultationDetails): Promise<void> {
    const ics = buildConsultationIcs(details);
    console.warn(
      "[booking] NOT DELIVERED — no email backend configured, this log is the only record:",
      bookingLogLine(details),
    );
    console.info("[booking] guest email\n", guestEmailText(details));
    console.info("[booking] host email\n", hostEmailText(details));
    console.info("[booking] invite.ics bytes:", ics.length);
    return Promise.resolve();
  }
}
