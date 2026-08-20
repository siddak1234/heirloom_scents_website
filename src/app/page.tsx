import { Marquee } from "@/components/motion";
import { CtaBand } from "@/components/patterns/cta-band";
import { PhotoInterlude } from "@/components/patterns/photo-interlude";
import { TestimonialCarousel } from "@/components/patterns/testimonial-carousel";
import { ButtonLink } from "@/components/primitives";
import { SiteFooterCentered } from "@/components/layout";
import {
  HomeCombinations,
  HomeExperience,
  HomeGallery,
  HomeHero,
  HomeMemory,
} from "@/components/sections/home";
import { HOME_COPY, MARQUEE_ITEMS, TESTIMONIALS } from "@/content/home";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeMemory />
      <HomeExperience />
      <HomeCombinations />
      <PhotoInterlude
        src="photo-cart-curtain"
        eyebrow={HOME_COPY.interludeEyebrow}
        heading={HOME_COPY.interludeHeading}
      />
      <Marquee items={MARQUEE_ITEMS} />
      <CtaBand id="events" heading={HOME_COPY.eventsHeading} emblemHeight={40}>
        <ButtonLink href="/booking" variant="cream">
          Book an Event →
        </ButtonLink>
        <ButtonLink href="/events" variant="muted">
          Explore Events
        </ButtonLink>
      </CtaBand>
      <HomeGallery />
      <TestimonialCarousel items={TESTIMONIALS} />
      <SiteFooterCentered />
    </>
  );
}
