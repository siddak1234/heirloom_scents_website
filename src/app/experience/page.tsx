import type { Metadata } from "next";
import Image from "next/image";
import { DarkBand, Section, SiteFooterSplit } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { CtaBand } from "@/components/patterns/cta-band";
import { ExperienceStep } from "@/components/patterns/experience-step";
import { FeatureColumns } from "@/components/patterns/feature-columns";
import { PhotoInterlude } from "@/components/patterns/photo-interlude";
import { Eyebrow } from "@/components/primitives";
import { FOOTER_EXPERIENCE } from "@/content/navigation";
import { image } from "@/content/media-manifest";
import { cn } from "@/lib/cn";
import { EXPERIENCE_COPY, EXPERIENCE_STEPS, INCLUDED } from "@/content/pages";

export const metadata: Metadata = {
  title: "The Experience",
  description: EXPERIENCE_COPY.blurb,
};

export default function ExperiencePage() {
  const hero = image("photo-step2-blend");
  return (
    <>
      <DarkBand as="section">
        <Image
          src={hero.src}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.36]"
          style={{ objectPosition: "center 35%" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-night/55 to-night/90" />
        <div className="relative mx-auto max-w-prose px-6 pt-32.5 pb-30 text-center desk:px-14">
          <Eyebrow tone="on-dark" className="tracking-hero">
            {EXPERIENCE_COPY.eyebrow}
          </Eyebrow>
          <h1 className="mt-5 font-heading text-display-lg leading-[1.04] font-normal text-cream">
            {EXPERIENCE_COPY.heading}
          </h1>
          <p className="mx-auto mt-6 max-w-[500px] text-body-md/[1.85] text-cream/85">
            {EXPERIENCE_COPY.blurb}
          </p>
        </div>
      </DarkBand>

      {EXPERIENCE_STEPS.map((step, i) => (
        <ExperienceStep
          key={step.no}
          step={step}
          className={cn(
            i === 0 && "pt-27.5",
            i === EXPERIENCE_STEPS.length - 1 ? "pb-27.5" : "pb-24",
          )}
        />
      ))}

      <PhotoInterlude src="photo-bottle-hand" heading={EXPERIENCE_COPY.interludeHeading} />

      <Reveal>
        <Section className="pt-25 pb-27.5">
          <Eyebrow className="text-center">{EXPERIENCE_COPY.includedEyebrow}</Eyebrow>
          <FeatureColumns items={INCLUDED} columns={4} className="mt-11" />
        </Section>
      </Reveal>

      <CtaBand
        heading={EXPERIENCE_COPY.ctaHeading}
        markHeight={40}
        cta="Book an Event"
        href="/booking"
      />
      <SiteFooterSplit links={FOOTER_EXPERIENCE} />
    </>
  );
}
