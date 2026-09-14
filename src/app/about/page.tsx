import type { Metadata } from "next";
import Link from "next/link";
import { DarkBand, Section, SiteFooterSplit } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { Eyebrow, Mark, Plate, PlateFrame, Rule } from "@/components/primitives";
import { FOOTER_MINIMAL } from "@/content/navigation";
import { ABOUT_COPY } from "@/content/pages";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT_COPY.body1.slice(0, 155),
};

export default function AboutPage() {
  return (
    <>
      <Section className="grid items-center gap-20 pt-24 pb-25 desk:grid-cols-[1fr_1.1fr]">
        <Plate
          src="brand-bottles"
          alt="Finished Heirloom bottles"
          ratio="4/5"
          sizes="(max-width: 860px) 100vw, 45vw"
          priority
          liftOnHover
        />
        <div>
          <Mark height={76} circle alt={`${SITE.name} monogram`} />
          <h1 className="mt-6.5 font-heading text-display-lg leading-[1.05] font-normal">
            {ABOUT_COPY.heading}
          </h1>
          <p className="mt-6.5 text-body-md/[1.9] text-ink/78 desk:text-justify">
            {ABOUT_COPY.body1}
          </p>
          <p className="mt-4.5 text-body-md/[1.9] text-ink/78 desk:text-justify">
            {ABOUT_COPY.body2}
          </p>
        </div>
      </Section>

      <Reveal>
        <Section className="pb-25">
          <Rule className="mb-18" />
          <div className="grid items-center gap-20 desk:grid-cols-[1.1fr_1fr]">
            <div>
              <Eyebrow>{ABOUT_COPY.founderEyebrow}</Eyebrow>
              <blockquote className="mt-5.5 font-heading text-heading-lg leading-[1.35] font-normal italic">
                {`“${ABOUT_COPY.founderQuote}”`}
              </blockquote>
              <Eyebrow as="footer" size="md" tone="muted" className="mt-5">
                {`— ${ABOUT_COPY.founderAttribution}`}
              </Eyebrow>
            </div>
            {/*
              The artboard's image slot here is empty — no founder portrait
              exists in the design project. The mat ships as the artboard draws
              it rather than borrowing an unrelated photograph.
              See docs/REVAMP-PLAN.md §9.
            */}
            <PlateFrame ratio="1/1" liftOnHover className="bg-surface">
              <p className="flex h-full items-center justify-center px-6 text-center text-label-md tracking-nav text-ink/65 uppercase">
                Founder portrait to come
              </p>
            </PlateFrame>
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <DarkBand className="px-6 py-20 desk:px-14">
          <ul className="mx-auto grid max-w-content gap-12 text-center desk:grid-cols-3">
            {ABOUT_COPY.contactColumns.map((column) => (
              <li key={column.label}>
                <Eyebrow as="div" size="md" tone="on-dark">
                  {column.label}
                </Eyebrow>
                {column.href ? (
                  <p className="mt-3 font-heading text-heading-xs">
                    <Link href={column.href} className="text-cream underline hover:text-accent">
                      {column.value}
                    </Link>
                  </p>
                ) : (
                  <p className="mt-3 font-heading text-heading-xs text-cream">{column.value}</p>
                )}
                <p className="mt-1.5 text-caption text-cream/62">{column.note}</p>
              </li>
            ))}
          </ul>
        </DarkBand>
      </Reveal>

      <SiteFooterSplit links={FOOTER_MINIMAL} />
    </>
  );
}
