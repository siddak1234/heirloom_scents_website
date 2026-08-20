import { DarkBand } from "@/components/layout";
import { FadeUp, KenBurns, ScrollCue } from "@/components/motion";
import { ArrowLink, ButtonLink, Emblem } from "@/components/primitives";
import { HOME_COPY } from "@/content/home";

export function HomeHero() {
  return (
    <DarkBand as="section" className="bg-burgundy">
      <KenBurns src="photo-hero-bg" opacity={0.34} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 15%, color-mix(in srgb, var(--color-burgundy-lift) 62%, transparent), color-mix(in srgb, var(--color-burgundy-deep) 94%, transparent) 78%)",
        }}
      />
      <div className="relative flex flex-col items-center px-6 pt-20 pb-16 text-center md:pt-section md:pb-19">
        <FadeUp delay={0.1}>
          <Emblem tone="cream" height={116} className="opacity-95 max-md:h-20" priority />
        </FadeUp>

        <FadeUp delay={0.28}>
          <h1 className="mt-9 [text-indent:0.26em] font-heading text-[clamp(2.75rem,10vw,var(--text-display-lg))] leading-none font-normal tracking-hero text-cream">
            {HOME_COPY.heroLead}
          </h1>
        </FadeUp>

        <FadeUp delay={0.44}>
          <p className="mt-[14px] [text-indent:0.68em] font-heading text-[clamp(1rem,3.5vw,var(--text-heading-sm))] font-normal tracking-wordmark text-accent">
            {HOME_COPY.heroWordmark}
          </p>
        </FadeUp>

        <FadeUp delay={0.6}>
          <div aria-hidden="true" className="my-10 h-[52px] w-px bg-cream/40" />
        </FadeUp>

        <FadeUp delay={0.72}>
          <p className="max-w-blurb text-[1rem]/[1.75] text-cream-90">{HOME_COPY.heroBlurb}</p>
        </FadeUp>

        <FadeUp delay={0.88}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-6 md:gap-9">
            <ButtonLink href="/booking" variant="cream" size="md">
              Book an Event
            </ButtonLink>
            <ArrowLink href="#experience" variant="cream">
              Discover the Experience
            </ArrowLink>
          </div>
        </FadeUp>

        <FadeUp delay={1.1}>
          <ScrollCue label="Scroll" className="mt-15" />
        </FadeUp>
      </div>
    </DarkBand>
  );
}
