import type { Metadata } from "next";
import { DarkBand, Section, SiteFooterSplit } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { CtaBand } from "@/components/patterns/cta-band";
import { PhotoInterlude } from "@/components/patterns/photo-interlude";
import { ArrowLink, ButtonLink, Eyebrow, NumberMark, pad2, Plate } from "@/components/primitives";
import { EXPERIENCE_COPY, EXPERIENCE_STEPS, INCLUDED } from "@/content/pages";
import { FOOTER_EVENTS } from "@/content/navigation";
import Image from "next/image";
import { image } from "@/content/image-manifest";

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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(color-mix(in srgb, var(--color-burgundy-deep) 55%, transparent), color-mix(in srgb, var(--color-burgundy-deep) 90%, transparent))",
          }}
        />
        <div className="relative mx-auto max-w-prose px-6 py-24 text-center md:px-14 md:py-30">
          <Eyebrow tone="on-dark">{EXPERIENCE_COPY.eyebrow}</Eyebrow>
          <h1 className="mt-5 font-heading text-[clamp(2.25rem,7vw,var(--text-display-sm))] leading-[1.04] font-normal text-cream">
            {EXPERIENCE_COPY.heading}
          </h1>
          <p className="mx-auto mt-6 max-w-[500px] text-body-md/[1.85] text-cream-85">
            {EXPERIENCE_COPY.blurb}
          </p>
        </div>
      </DarkBand>

      {EXPERIENCE_STEPS.map((step, i) => (
        <Section
          key={step.no}
          className={i === 0 ? "pt-20 pb-16 lg:pt-section lg:pb-24" : "pb-16 lg:pb-24"}
        >
          <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-18">
            <div className={step.imageFirst ? "" : "lg:order-2"}>
              <Plate
                src={step.image}
                alt={step.imageAlt}
                ratio="5/4"
                zoomOnHover
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className={`relative ${step.imageFirst ? "" : "lg:order-1"}`}>
              <NumberMark
                variant="ghost"
                aria-hidden="true"
                className="absolute -top-18 -left-3 hidden lg:block"
              >
                {pad2(step.no)}
              </NumberMark>
              <div className="relative">
                <Eyebrow>{step.eyebrow}</Eyebrow>
                <h2 className="mt-3 font-heading text-[clamp(1.75rem,5vw,var(--text-title-md))] leading-[1.1] font-normal">
                  {step.title}
                </h2>
                <p className="mt-4 text-body/[1.85] text-ink-70 md:text-justify">{step.body}</p>
                {step.link ? (
                  <ArrowLink href={step.link.href} className="mt-6">
                    {step.link.label}
                  </ArrowLink>
                ) : null}
              </div>
            </div>
          </Reveal>
        </Section>
      ))}

      <PhotoInterlude
        src="photo-bottle-hand"
        heading={EXPERIENCE_COPY.interludeHeading}
        showEmblem
        objectPosition="center 40%"
        className="h-[360px] md:h-[400px]"
      />

      <Section className="py-20 lg:py-25">
        <Reveal>
          <Eyebrow className="text-center">{EXPERIENCE_COPY.includedEyebrow}</Eyebrow>
          <ul className="mt-11 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED.map((item) => (
              <li key={item.title} className="border-t border-divider pt-5">
                <h3 className="font-heading text-subtitle-md font-semibold">{item.title}</h3>
                <p className="mt-2 text-body-xs/[1.7] text-ink-65">{item.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <CtaBand heading={EXPERIENCE_COPY.ctaHeading} emblemHeight={40} headingSize="sm">
        <ButtonLink href="/booking" variant="cream">
          Book an Event →
        </ButtonLink>
      </CtaBand>

      <SiteFooterSplit links={FOOTER_EVENTS} />
    </>
  );
}
