import { Section, SiteFooterFull } from "@/components/layout";
import { Marquee } from "@/components/motion";
import { FeatureColumns } from "@/components/patterns/feature-columns";
import { HeroSlideshow } from "@/components/patterns/hero-slideshow";
import { NewsletterBand } from "@/components/patterns/newsletter-band";
import { StorySplit } from "@/components/patterns/story-split";
import { TestimonialCarousel } from "@/components/patterns/testimonial-carousel";
import { VideoBand } from "@/components/patterns/video-band";
import { ButtonLink } from "@/components/primitives";
import { HomeCombinations, HomeScentRow } from "@/components/sections/home";
import {
  HERO_SLIDES,
  HOME_COPY,
  HOME_VIDEO,
  MARQUEE_ITEMS,
  TESTIMONIALS,
  VALUE_PROPS,
} from "@/content/home";

export default function HomePage() {
  return (
    <>
      <HeroSlideshow slides={HERO_SLIDES} />
      <HomeScentRow />
      <HomeCombinations />
      <Marquee items={MARQUEE_ITEMS} />

      <VideoBand
        src={HOME_VIDEO}
        opacity={0.6}
        veilFrom={35}
        veilTo={75}
        className="h-[72vh] min-h-[440px]"
      >
        <h2 className="max-w-[700px] font-heading text-display-md leading-[1.08] font-normal text-cream">
          {HOME_COPY.videoHeading}
        </h2>
        <p className="mt-4 text-body-md text-cream/88">{HOME_COPY.videoBlurb}</p>
        <ButtonLink href="/events" variant="cream" size="sm" className="mt-7.5 px-8">
          {HOME_COPY.videoCta}
        </ButtonLink>
      </VideoBand>

      <StorySplit
        eyebrow={HOME_COPY.aboutEyebrow}
        heading={HOME_COPY.aboutHeading}
        body={HOME_COPY.aboutBody}
        cta={HOME_COPY.aboutCta}
        href="/about"
        ctaStyle="link"
        image="brand-gold-stand"
        imageAlt="The Heirloom bar"
      />

      <NewsletterBand />

      <Section className="pb-22.5">
        <FeatureColumns items={VALUE_PROPS} columns={3} />
      </Section>

      <TestimonialCarousel items={TESTIMONIALS} />
      <SiteFooterFull />
    </>
  );
}
