import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { StepRow } from "@/components/patterns/step-row";
import { ArrowLink, Eyebrow, Plate, Rule } from "@/components/primitives";
import { HOME_STEPS } from "@/content/home";

export function HomeExperience() {
  return (
    <Section id="experience" className="pb-20 lg:pb-section">
      <Rule className="mb-14 lg:mb-22" />
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-18">
        <Reveal>
          <Plate
            src="photo-cart-hero"
            alt="The Heirloom cart at an event"
            ratio="4/3"
            zoomOnHover
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
        </Reveal>
        <Reveal>
          <Eyebrow>The Heirloom Experience</Eyebrow>
          <ol className="mt-6 grid">
            {HOME_STEPS.map((step, i) => (
              <StepRow key={step.no} step={step} last={i === HOME_STEPS.length - 1} />
            ))}
          </ol>
          <ArrowLink href="/experience" className="mt-7">
            See the full experience
          </ArrowLink>
        </Reveal>
      </div>
    </Section>
  );
}
