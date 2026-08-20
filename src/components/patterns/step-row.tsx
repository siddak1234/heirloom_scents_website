import { NumberMark, pad2 } from "@/components/primitives";
import type { Step } from "@/content/home";
import { cn } from "@/lib/cn";

/** One numbered row in the home page's four-step Experience list. */
export function StepRow({ step, last = false }: { readonly step: Step; readonly last?: boolean }) {
  return (
    <li
      className={cn(
        "grid grid-cols-[48px_1fr] items-baseline gap-5 py-5 sm:grid-cols-[64px_1fr]",
        !last && "border-b border-divider",
      )}
    >
      <NumberMark variant="step">{pad2(step.no)}</NumberMark>
      <div>
        <h3 className="font-heading text-subtitle-lg font-semibold">{step.title}</h3>
        <p className="mt-1 text-body-sm/[1.7] text-ink-65">{step.body}</p>
      </div>
    </li>
  );
}
