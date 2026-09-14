import type { Metadata } from "next";
import { DarkBand, SiteFooterOnDark } from "@/components/layout";
import { FadeUp, KenBurns, ScrollCue } from "@/components/motion";
import { ButtonLink, Eyebrow, Mark } from "@/components/primitives";
import { ScentRail, ScentSlide, SnapScope } from "@/components/sections/scents";
import { FOOTER_SCENTS } from "@/content/navigation";
import { SCENTS_COPY } from "@/content/pages";
import { SCENTS } from "@/content/scents";

export const metadata: Metadata = {
  title: "The Scents",
  description: SCENTS_COPY.blurb,
};

/** The hero's entrance cadence, in seconds, exactly as the artboard staggers it. */
const ENTRANCE = [0.1, 0.26, 0.4, 0.56, 0.8] as const;

export default function ScentsPage() {
  return (
    <>
      <SnapScope />
      <ScentRail />

      <DarkBand
        as="section"
        aria-labelledby="scents-heading"
        className="flex min-h-[560px] snap-start snap-always desk:h-[calc(100vh-var(--nav-h))]"
      >
        <KenBurns src="bg-scents-hero" objectPosition="center 40%" durationSeconds={24} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 110% 90% at 50% 45%, color-mix(in srgb, var(--color-night) 28%, transparent), color-mix(in srgb, var(--color-veil) 82%, transparent) 85%)",
          }}
        />
        <div className="relative flex h-full w-full flex-col items-center justify-center px-6 py-20 text-center">
          <FadeUp delay={ENTRANCE[0]}>
            <Mark height={64} className="opacity-95" priority />
          </FadeUp>
          <FadeUp delay={ENTRANCE[1]} className="mt-6.5">
            <Eyebrow tone="on-dark" className="tracking-widest">
              {SCENTS_COPY.eyebrow}
            </Eyebrow>
          </FadeUp>
          <FadeUp delay={ENTRANCE[2]}>
            <h1
              id="scents-heading"
              className="mt-4 font-heading text-title-lg leading-none font-normal text-cream desk:text-display-2xl"
            >
              {SCENTS_COPY.heading}
            </h1>
          </FadeUp>
          <FadeUp delay={ENTRANCE[3]}>
            <p className="mt-6 max-w-[440px] text-body-lg/[1.8] text-cream/86">
              {SCENTS_COPY.blurb}
            </p>
          </FadeUp>
          <FadeUp delay={ENTRANCE[4]} className="mt-14">
            <ScrollCue label={SCENTS_COPY.scrollCue} />
          </FadeUp>
        </div>
      </DarkBand>

      {SCENTS.map((scent, i) => (
        <ScentSlide key={scent.slug} scent={scent} priority={i === 0} />
      ))}

      <DarkBand
        as="section"
        className="flex min-h-[560px] snap-start flex-col desk:h-[calc(100vh-var(--nav-h))]"
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center desk:px-14">
          <Mark height={44} className="opacity-90" />
          <h2 className="mt-6.5 font-heading text-display-xs font-normal text-cream">
            {SCENTS_COPY.closeHeading}
          </h2>
          <p className="mt-3.5 max-w-[400px] text-body-sm/[1.8] text-cream/72">
            {SCENTS_COPY.closeBlurb}
          </p>
          <ButtonLink href="/booking" variant="cream" size="md" className="mt-8.5">
            {SCENTS_COPY.closeCta}
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
        <SiteFooterOnDark links={FOOTER_SCENTS} />
      </DarkBand>
    </>
  );
}
