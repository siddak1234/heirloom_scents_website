import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { Eyebrow, Rule } from "@/components/primitives";
import { CombinationCard } from "@/components/patterns/combination-card";
import { COMBINATIONS, HOME_COPY } from "@/content/home";

/** "Popular combinations" — the 2 × 2 card grid. */
export function HomeCombinations() {
  return (
    <Section className="pb-25">
      <Rule className="mb-20" />
      <Reveal className="mb-13 text-center">
        <Eyebrow tone="on-dark" className="text-accent-700">
          {HOME_COPY.combinationsEyebrow}
        </Eyebrow>
        <h2 className="mt-3 font-heading text-display-sm font-normal">
          {HOME_COPY.combinationsHeading}
        </h2>
      </Reveal>
      <ul className="grid gap-7 desk:grid-cols-2">
        {COMBINATIONS.map((combination) => (
          <li key={combination.no}>
            <Reveal className="h-full">
              <CombinationCard combination={combination} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
