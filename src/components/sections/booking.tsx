import Image from "next/image";
import { DarkBand, SiteFooterBooking } from "@/components/layout";
import { CalendlyEmbed } from "@/components/patterns/calendly-embed";
import { ArrowLink, Eyebrow, Mark, NumberMark } from "@/components/primitives";
import { image } from "@/content/media-manifest";
import { BOOKING_COPY } from "@/content/pages";
import { SITE } from "@/content/site";

/** Set in Vercel; a public scheduling link, not a secret. */
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL;

/**
 * The booking screen. The artboard's aside is unchanged — night ground, the
 * mark, the heading, the three numbered steps. The right column, which used to
 * hold a hand-built calendar and slot picker, is now Calendly's inline embed.
 *
 * Why the calendar is not ours: the hand-built version had no connection to
 * anyone's real calendar, so it would take a slot that was already committed.
 * Reminders, reschedule, cancellation, timezone correctness and the meeting
 * link all come with the scheduler. See docs/DESIGN-PARITY.md.
 *
 * This is a server component. Only the embed itself is client-side.
 */
export function BookingScreen() {
  const aside = image("photo-artist-pour");

  return (
    <>
      <div className="grid desk:min-h-[calc(100vh-var(--nav-h))] desk:grid-cols-[minmax(360px,42%)_1fr]">
        <DarkBand as="aside" className="flex flex-col justify-between">
          <Image
            src={aside.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 860px) 100vw, 42vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-veil-lift) 55%, transparent), color-mix(in srgb, var(--color-night) 95%, transparent))",
            }}
          />
          <div className="relative px-6 pt-16 desk:px-14">
            <Mark height={56} className="opacity-95" priority />
            <h1 className="mt-7 font-heading text-title-lg leading-[1.06] font-normal text-cream desk:text-display-md">
              {BOOKING_COPY.asideHeading[0]}
              <br />
              {BOOKING_COPY.asideHeading[1]}
            </h1>
            <p className="mt-5 max-w-[380px] text-body/[1.85] text-cream/82">
              {BOOKING_COPY.asideBlurb}
            </p>
          </div>
          <div className="relative px-6 pt-10 pb-14 desk:px-14">
            <ol className="flex max-w-[320px] flex-col">
              {BOOKING_COPY.asideSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 border-t border-cream/18 py-[13px]"
                >
                  <NumberMark variant="inline">{String(i + 1)}</NumberMark>
                  <span className="text-body-xs text-cream/82">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </DarkBand>

        <div className="flex flex-col justify-center px-6 py-16 desk:px-18">
          <Eyebrow>{BOOKING_COPY.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-heading text-heading-md leading-[1.06] font-normal desk:text-title-xl">
            {BOOKING_COPY.formHeading}
          </h2>
          <div className="mt-9">
            {CALENDLY_URL ? (
              <CalendlyEmbed url={CALENDLY_URL} />
            ) : (
              /*
               * No scheduling link configured. Say so and give a route that
               * works — an empty box, or a form that accepts a booking and
               * drops it, is worse than an honest message.
               */
              <div className="border border-divider px-8 py-10">
                <p className="text-body-md/[1.8] text-ink/78">{BOOKING_COPY.unconfigured}</p>
                <ArrowLink
                  href={`https://www.instagram.com/${SITE.instagram.replace("@", "")}`}
                  className="mt-6"
                >
                  {`Message us on Instagram`}
                </ArrowLink>
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooterBooking />
    </>
  );
}
