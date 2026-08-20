import { ArrowLink, NumberMark } from "@/components/primitives";
import type { Combination } from "@/content/home";

/** One of the four "Popular combinations" cards — bordered, never filled. */
export function CombinationCard({ combination }: { readonly combination: Combination }) {
  return (
    <article className="flex flex-col gap-[14px] border border-divider p-8 transition-[border-color,box-shadow] duration-400 ease-brand hover:border-accent hover:shadow-sm sm:px-9 sm:py-9">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-heading-md font-semibold">{combination.name}</h3>
        <NumberMark variant="label">No. {String(combination.no)}</NumberMark>
      </div>
      <p className="text-label-sm tracking-note text-accent-700 uppercase">{combination.notes}</p>
      <p className="flex-1 text-body-sm/[1.7] text-ink-65">{combination.blurb}</p>
      <ArrowLink href={`/scents#${combination.anchor}`} size="sm">
        Read these scents
      </ArrowLink>
    </article>
  );
}
