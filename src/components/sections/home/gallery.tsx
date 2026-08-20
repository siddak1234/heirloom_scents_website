import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { Eyebrow, Plate } from "@/components/primitives";
import { GALLERY, HOME_COPY } from "@/content/home";
import { SITE } from "@/content/site";

export function HomeGallery() {
  return (
    <Section className="pt-20 pb-16 lg:pt-section lg:pb-24">
      <Reveal className="mb-9 flex items-baseline justify-between gap-4">
        <Eyebrow>{HOME_COPY.galleryEyebrow}</Eyebrow>
        <p className="text-body-xs text-ink-65">{SITE.instagram}</p>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-3">
        {GALLERY.map((item) => (
          <Reveal key={item.image}>
            <Plate
              src={item.image}
              alt={item.alt}
              ratio="4/5"
              zoomOnHover
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
