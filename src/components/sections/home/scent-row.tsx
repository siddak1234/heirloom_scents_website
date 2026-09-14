import Link from "next/link";
import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { ButtonLink, Eyebrow, Plate } from "@/components/primitives";
import { CardRail } from "@/components/patterns/card-rail";
import { HOME_COPY } from "@/content/home";
import { SCENTS } from "@/content/scents";

/** "Explore Our Scents" — all eight, in a paged snap rail. */
export function HomeScentRow() {
  return (
    <Section className="pt-25 pb-22.5">
      <Reveal className="mb-13 text-center">
        <Eyebrow tone="on-dark" className="text-accent-700">
          {HOME_COPY.scentsEyebrow}
        </Eyebrow>
        <h2 className="mt-3 font-heading text-display-md font-normal">{HOME_COPY.scentsHeading}</h2>
      </Reveal>

      <CardRail
        label="The eight house scents"
        backLabel="Scroll scents back"
        forwardLabel="Scroll scents forward"
      >
        {SCENTS.map((scent) => (
          <li key={scent.slug} className="w-[262px] flex-none snap-start">
            <Link
              href="/scents"
              className="group/card flex flex-col gap-3 text-ink no-underline hover:text-accent-700"
            >
              <Plate
                src={scent.image}
                alt={scent.name}
                ratio="4/5"
                sizes="262px"
                className="min-w-0"
              />
              <span className="font-heading text-subtitle-xl font-semibold">{scent.name}</span>
              <span className="-mt-2 text-label-xs tracking-link text-accent-700 uppercase">
                {scent.shortOrigin}
              </span>
            </Link>
          </li>
        ))}
      </CardRail>

      <Reveal className="mt-11 text-center">
        <ButtonLink href="/scents" variant="accent" size="sm" className="px-[34px]">
          {HOME_COPY.scentsCta}
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
