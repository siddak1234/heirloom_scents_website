import type { Metadata } from "next";
import { DarkBand, Section, SiteFooterSplit } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { Emblem, Eyebrow, Plate, Rule } from "@/components/primitives";
import { ABOUT_COPY } from "@/content/pages";
import { FOOTER_ABOUT } from "@/content/navigation";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT_COPY.body1.slice(0, 155),
};

export default function AboutPage() {
  return (
    <>
      <Section className="grid items-center gap-12 pt-16 pb-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:pt-24 lg:pb-25">
        <Plate
          src="photo-bottle-hand"
          alt="A finished Heirloom bottle"
          ratio="4/5"
          sizes="(max-width: 1024px) 100vw, 45vw"
          liftOnHover
        />
        <div>
          <Emblem tone="gold" height={44} />
          <h1 className="mt-6 font-heading text-[clamp(2.25rem,7vw,var(--text-display-sm))] leading-[1.05] font-normal">
            {ABOUT_COPY.heading}
          </h1>
          <p className="mt-6 text-body-md/[1.9] text-ink-80 md:text-justify">{ABOUT_COPY.body1}</p>
          <p className="mt-4 text-body-md/[1.9] text-ink-80 md:text-justify">{ABOUT_COPY.body2}</p>
        </div>
      </Section>

      <Section className="pb-20 lg:pb-25">
        <Rule className="mb-14 lg:mb-18" />
        <Reveal className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>{ABOUT_COPY.founderEyebrow}</Eyebrow>
            <blockquote className="mt-5">
              <p className="font-heading text-[clamp(1.5rem,4.5vw,var(--text-heading-xl))] leading-[1.35] font-normal italic">
                “{ABOUT_COPY.founderQuote}”
              </p>
              <Eyebrow as="footer" size="md" tone="muted" className="mt-5">
                — {ABOUT_COPY.founderAttribution}
              </Eyebrow>
            </blockquote>
          </div>
          <Plate
            src="photo-closeup-tray"
            alt={ABOUT_COPY.founderPortraitAlt}
            ratio="1/1"
            sizes="(max-width: 1024px) 100vw, 45vw"
            liftOnHover
          />
        </Reveal>
      </Section>

      <DarkBand as="section" className="px-6 py-20 md:px-14">
        <div className="mx-auto grid max-w-content gap-12 text-center sm:grid-cols-3">
          <div>
            <Eyebrow size="md" tone="on-dark">
              Find us
            </Eyebrow>
            <p className="mt-3 font-heading text-heading-xs text-cream">
              {SITE.locality}, {SITE.region}
            </p>
            <p className="mt-[6px] text-body-xs text-cream-60">
              Serving {SITE.serviceArea} &amp; beyond
            </p>
          </div>
          <div>
            <Eyebrow size="md" tone="on-dark">
              Write to us
            </Eyebrow>
            <p className="mt-3 font-heading text-heading-xs text-cream">
              <a href={`mailto:${SITE.email}`} className="text-cream hover:text-accent">
                {SITE.email}
              </a>
            </p>
            <p className="mt-[6px] text-body-xs text-cream-60">
              Email &amp; phone stubs — to confirm
            </p>
          </div>
          <div>
            <Eyebrow size="md" tone="on-dark">
              Follow along
            </Eyebrow>
            <p className="mt-3 font-heading text-heading-xs text-cream">{SITE.instagram}</p>
            <p className="mt-[6px] text-body-xs text-cream-60">Recent celebrations, weekly</p>
          </div>
        </div>
      </DarkBand>

      <SiteFooterSplit links={FOOTER_ABOUT} />
    </>
  );
}
