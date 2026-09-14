import { DarkBand } from "@/components/layout";
import { ButtonLink, Mark } from "@/components/primitives";
import { cn } from "@/lib/cn";

/**
 * The night call-to-action band closing /experience and /events. Events adds a
 * dotted row of the four event types above the heading; otherwise identical.
 */
export function CtaBand({
  heading,
  chips,
  markHeight,
  cta,
  href,
  id,
  className,
}: {
  readonly heading: string;
  readonly chips?: readonly string[] | undefined;
  readonly markHeight?: number | undefined;
  readonly cta: string;
  readonly href: string;
  readonly id?: string | undefined;
  readonly className?: string | undefined;
}) {
  return (
    <DarkBand id={id} className={cn("px-6 py-18 text-center desk:px-14", className)}>
      {chips ? (
        <ul className="mb-7 flex flex-wrap justify-center gap-[14px] text-label-lg tracking-nav text-cream/62 uppercase">
          {chips.map((chip, i) => (
            <li key={chip} className="flex items-center gap-[14px]">
              {chip}
              {i < chips.length - 1 ? (
                <span aria-hidden="true" className="text-accent">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {markHeight ? <Mark height={markHeight} className="mx-auto opacity-90" /> : null}

      <h2 className="mt-6 font-heading text-title-md font-normal text-cream">{heading}</h2>

      <ButtonLink href={href} variant="cream" size="md" className="mt-8">
        {cta}
        <span aria-hidden="true">→</span>
      </ButtonLink>
    </DarkBand>
  );
}
