import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { CombinationCard } from "@/components/patterns/combination-card";
import { Eyebrow, Rule } from "@/components/primitives";
import { COMBINATIONS, HOME_COPY } from "@/content/home";

export function HomeCombinations() {
  return (
    <Section className="pb-20 lg:pb-section">
      <Rule className="mb-14 lg:mb-22" />
      <Reveal className="mb-14 text-center">
        <Eyebrow>{HOME_COPY.combinationsEyebrow}</Eyebrow>
        <h2 className="mt-4 font-heading text-[clamp(2rem,6vw,var(--text-title-xl))] font-normal">
          {HOME_COPY.combinationsHeading}
        </h2>
        <p className="mt-3 text-body/[1.6] text-ink-65">{HOME_COPY.combinationsBlurb}</p>
      </Reveal>
      <div className="grid gap-7 md:grid-cols-2">
        {COMBINATIONS.map((c) => (
          <Reveal key={c.no}>
            <CombinationCard combination={c} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
