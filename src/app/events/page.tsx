import type { Metadata } from "next";
import { Section, SiteFooterMarked } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { CtaBand } from "@/components/patterns/cta-band";
import { EventTypeCard } from "@/components/patterns/event-type-card";
import { FilmGrid } from "@/components/patterns/film-grid";
import { NewsletterBand } from "@/components/patterns/newsletter-band";
import { StorySplit } from "@/components/patterns/story-split";
import { VideoBand } from "@/components/patterns/video-band";
import { ButtonLink, Eyebrow, Rule } from "@/components/primitives";
import { FOOTER_MINIMAL } from "@/content/navigation";
import { EVENT_TYPES, EVENTS_COPY, REELS } from "@/content/pages";

export const metadata: Metadata = {
  title: "Events",
  description: EVENTS_COPY.celebrateBody.slice(0, 155),
};

export default function EventsPage() {
  return (
    <>
      <VideoBand
        src="reel-4"
        opacity={0.55}
        veilFrom={40}
        veilTo={78}
        className="h-[76vh] min-h-[480px]"
      >
        <Eyebrow tone="on-dark" className="tracking-hero">
          {EVENTS_COPY.eyebrow}
        </Eyebrow>
        <h1 className="mt-4.5 max-w-[820px] font-heading text-display-lg leading-[1.05] font-normal text-cream">
          {EVENTS_COPY.heading}
        </h1>
        <ButtonLink href="/booking" variant="cream" size="md" className="mt-8.5">
          {EVENTS_COPY.heroCta}
        </ButtonLink>
      </VideoBand>

      <StorySplit
        eyebrow={EVENTS_COPY.celebrateEyebrow}
        heading={EVENTS_COPY.celebrateHeading}
        body={EVENTS_COPY.celebrateBody}
        cta={EVENTS_COPY.celebrateCta}
        href="/booking"
        ctaStyle="button"
        image="brand-cart"
        imageAlt="The Heirloom cart"
        imageFirst
      />

      <Section className="pb-25">
        <Rule className="mb-18" />
        <ul className="grid gap-x-12 gap-y-14 desk:grid-cols-2">
          {EVENT_TYPES.map((event) => (
            <li key={event.slug}>
              <EventTypeCard event={event} />
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pb-27.5">
        <Rule className="mb-16" />
        <Reveal className="mb-9 flex items-baseline justify-between gap-6">
          <Eyebrow>{EVENTS_COPY.filmEyebrow}</Eyebrow>
          <p className="text-caption-sm text-ink/65">{EVENTS_COPY.filmHint}</p>
        </Reveal>
        <FilmGrid reels={REELS} />
      </Section>

      <CtaBand
        heading={EVENTS_COPY.ctaHeading}
        chips={EVENT_TYPES.map((event) => event.name)}
        cta="Book an Event"
        href="/booking"
      />
      <NewsletterBand />
      <SiteFooterMarked links={FOOTER_MINIMAL} />
    </>
  );
}
