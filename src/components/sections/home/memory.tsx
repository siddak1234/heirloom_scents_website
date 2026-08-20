import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { ArrowLink } from "@/components/primitives";
import { HOME_COPY } from "@/content/home";

export function HomeMemory() {
  return (
    <Section className="grid items-end gap-12 pt-20 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-18 lg:pt-section lg:pb-24">
      <Reveal>
        <h2 className="font-heading text-[clamp(2.5rem,8vw,var(--text-display-xl))] leading-[0.98] font-normal">
          {HOME_COPY.memoryHeading}
        </h2>
      </Reveal>
      <Reveal>
        <p className="text-body-lg/[1.85] text-ink-80 md:text-justify">{HOME_COPY.memoryBody}</p>
        <ArrowLink href="/scents" className="mt-7">
          Read the scent library
        </ArrowLink>
      </Reveal>
    </Section>
  );
}
