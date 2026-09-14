import { ArrowLink, NumberMark } from "@/components/primitives";
import type { Combination } from "@/content/home";
import { HOME_COPY } from "@/content/home";

/** One of the four "Popular combinations" cards — bordered, never filled. */
export function CombinationCard({ combination }: { readonly combination: Combination }) {
  return (
    <article className="flex flex-col gap-[14px] border border-divider px-9 py-9.5 transition-[border-color,box-shadow] duration-400 ease-brand hover:border-accent hover:shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-heading-sm font-semibold">{combination.name}</h3>
        <NumberMark variant="label">No. {String(combination.no)}</NumberMark>
      </div>
      <p className="text-label-md tracking-note text-accent-700 uppercase">{combination.notes}</p>
      <p className="flex-1 text-body-sm/[1.7] text-ink/66">{combination.blurb}</p>
      <ArrowLink href="/scents" size="sm" className="border-b-0 pb-0">
        {HOME_COPY.combinationsLink}
      </ArrowLink>
    </article>
  );
}
