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

export interface Notifier {
  sendConsultationEmails(details: ConsultationDetails): Promise<void>;
}

/**
 * No transport is wired yet. The messages and the .ics attachment are fully
 * built here; connecting Resend is a single send() call per message.
 * See docs/DEPLOYMENT.md for the environment variables it needs.
 */
export class ConsoleNotifier implements Notifier {
  sendConsultationEmails(details: ConsultationDetails): Promise<void> {
    const ics = buildConsultationIcs(details);
    console.info("[booking] guest email\n", guestEmailText(details));
    console.info("[booking] host email\n", hostEmailText(details));
    console.info("[booking] invite.ics bytes:", ics.length);
    return Promise.resolve();
  }
}
