import { ArrowLink, Eyebrow, NumberMark, pad2, Plate } from "@/components/primitives";
import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import type { ExperienceStep as Step } from "@/content/pages";
import { cn } from "@/lib/cn";

/**
 * One of the three steps on /experience. The image alternates side — left on
 * steps one and three, right on step two — and the step number sits behind the
 * heading as a 190px watermark.
 */
export function ExperienceStep({
  step,
  className,
}: {
  readonly step: Step;
  readonly className?: string | undefined;
}) {
  const imageFirst = step.no % 2 === 1;

  const plate = (
    <Plate
      src={step.image}
      alt={step.imageAlt}
      ratio="5/4"
      sizes="(max-width: 860px) 100vw, 50vw"
      zoomOnHover
    />
  );

  const copy = (
    <div className="relative">
      <NumberMark variant="ghost" aria-hidden="true" className="absolute -top-18 -left-3.5">
        {pad2(step.no)}
      </NumberMark>
      <div className="relative">
        <Eyebrow>{step.eyebrow}</Eyebrow>
        <h2 className="mt-3.5 font-heading text-title-lg leading-[1.1] font-normal">
          {step.title}
        </h2>
        <p className="mt-4.5 text-body/[1.85] text-ink/74 desk:text-justify">{step.body}</p>
        {step.link ? (
          <ArrowLink href={step.link.href} size="sm" className="mt-6">
            {step.link.label}
          </ArrowLink>
        ) : null}
      </div>
    </div>
  );

  return (
    <Reveal>
      <Section className={cn("grid items-center gap-18 desk:grid-cols-2", className)}>
        {imageFirst ? plate : copy}
        {imageFirst ? copy : plate}
      </Section>
    </Reveal>
  );
}
