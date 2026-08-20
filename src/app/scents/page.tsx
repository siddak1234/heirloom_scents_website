import type { Metadata } from "next";
import { DarkBand, SiteFooterOnDark } from "@/components/layout";
import { FadeUp, KenBurns, ScrollCue } from "@/components/motion";
import { ButtonLink, Emblem, Eyebrow } from "@/components/primitives";
import { ScentRail, ScentSlide } from "@/components/sections/scents";
import { SCENTS } from "@/content/scents";
import { FOOTER_COMPACT } from "@/content/navigation";

export const metadata: Metadata = {
  title: "The Scents",
  description:
    "Eight fragrances, composed in our Dallas studio and poured at the cart. Every blend your guests create begins here.",
};

export default function ScentsPage() {
  return (
    <>
      <ScentRail />
      {/*
        A route-scoped snap container rather than mutating scroll-snap on <html>.
        Below lg it collapses to normal document flow, because a mandatory snap
        deck on a phone traps the scroll and makes the page hard to leave.
      */}
      <div className="lg:h-[calc(100vh-var(--nav-h))] lg:snap-y lg:snap-mandatory lg:overflow-y-scroll">
        <DarkBand as="section" className="flex min-h-[560px] snap-start lg:h-full">
          <KenBurns src="bg-scents-hero" objectPosition="center 40%" durationSeconds={24} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 110% 90% at 50% 45%, color-mix(in srgb, var(--color-burgundy-deep) 28%, transparent), color-mix(in srgb, var(--color-burgundy-dark) 82%, transparent) 85%)",
            }}
          />
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 text-center">
            <FadeUp delay={0.1}>
              <Emblem tone="cream" height={64} className="opacity-95" priority />
            </FadeUp>
            <FadeUp delay={0.26}>
              <Eyebrow size="sm" tone="on-dark" className="mt-6">
                The Scent Library
              </Eyebrow>
            </FadeUp>
            <FadeUp delay={0.4}>
              <h1 className="mt-4 font-heading text-[clamp(3rem,11vw,var(--text-display-2xl))] leading-none font-normal text-cream">
                Our Scents
              </h1>
            </FadeUp>
            <FadeUp delay={0.56}>
              <p className="mt-6 max-w-[440px] text-body-lg/[1.8] text-cream-85">
                Eight fragrances, composed in our Dallas studio and poured at the cart. Every blend
                your guests create begins here.
              </p>
            </FadeUp>
            <FadeUp delay={0.8}>
              <ScrollCue label="Scroll to meet them" className="mt-14" />
            </FadeUp>
          </div>
        </DarkBand>

        {SCENTS.map((scent) => (
          <ScentSlide key={scent.slug} scent={scent} />
        ))}

        <DarkBand as="section" className="flex min-h-[560px] snap-start flex-col lg:h-full">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-14">
            <Emblem tone="cream" height={44} className="opacity-90" />
            <h2 className="mt-7 font-heading text-[clamp(1.875rem,6vw,var(--text-title-xl))] font-normal text-cream">
              Reading is one thing. Smelling is another.
            </h2>
            <p className="mx-auto mt-4 max-w-blurb text-body-sm/[1.8] text-cream-60">
              All eight travel with the cart to every event.
            </p>
            <ButtonLink href="/booking" variant="cream" className="mt-9">
              Book an Event →
            </ButtonLink>
          </div>
          <SiteFooterOnDark links={FOOTER_COMPACT} />
        </DarkBand>
      </div>
    </>
  );
}
