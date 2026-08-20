import type { Metadata } from "next";
import { Section, SiteFooterSplit } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { CtaBand } from "@/components/patterns/cta-band";
import { ArrowLink, ButtonLink, Eyebrow, Plate } from "@/components/primitives";
import { EVENT_TYPES, EVENTS_COPY } from "@/content/pages";
import { FOOTER_COMPACT } from "@/content/navigation";
import { MARQUEE_ITEMS } from "@/content/home";

export const metadata: Metadata = {
  title: "Events",
  description: EVENTS_COPY.blurb,
};

export default function EventsPage() {
  return (
    <>
      <Section as="header" width="prose" className="pt-16 pb-14 text-center lg:pt-24 lg:pb-20">
        <Eyebrow>{EVENTS_COPY.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-heading text-[clamp(2.25rem,7vw,var(--text-display-sm))] leading-[1.04] font-normal">
          {EVENTS_COPY.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-[500px] text-body-md/[1.85] text-ink-70">
          {EVENTS_COPY.blurb}
        </p>
      </Section>

      <Section className="grid gap-14 pb-20 md:grid-cols-2 md:gap-x-12 lg:pb-25">
        {EVENT_TYPES.map((event) => (
          <Reveal key={event.slug} className="flex flex-col gap-[18px]">
            <Plate
              src={event.image}
              alt={event.imageAlt}
              ratio="4/3"
              sizes="(max-width: 768px) 100vw, 50vw"
              liftOnHover
            />
            <div className="flex items-baseline justify-between gap-4 border-t border-divider pt-[18px]">
              <h2 className="font-heading text-[clamp(1.5rem,4vw,var(--text-heading-xl))] font-normal">
                {event.name}
              </h2>
              <ArrowLink href="/booking" size="sm">
                Book this
              </ArrowLink>
            </div>
            <p className="text-body-sm/[1.8] text-ink-70 md:text-justify">{event.body}</p>
          </Reveal>
        ))}
      </Section>

      <CtaBand heading={EVENTS_COPY.ctaHeading} chips={MARQUEE_ITEMS.slice(0, 4)} headingSize="sm">
        <ButtonLink href="/booking" variant="cream">
          Book an Event →
        </ButtonLink>
      </CtaBand>

      <SiteFooterSplit links={FOOTER_COMPACT} />
    </>
  );
}
