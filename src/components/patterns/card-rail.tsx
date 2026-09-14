"use client";

import { useRef } from "react";
import { RoundButton } from "@/components/primitives";

/**
 * A horizontal scroll-snap rail with a button pager, as the home page's scent
 * row. The artboard scrolls by 846px per press — exactly three 262px cards plus
 * their 20px gaps — so the pager always lands on a card edge.
 */
export function CardRail({
  children,
  scrollBy = 846,
  label,
  backLabel,
  forwardLabel,
  className,
}: {
  readonly children: React.ReactNode;
  readonly scrollBy?: number;
  readonly label: string;
  readonly backLabel: string;
  readonly forwardLabel: string;
  readonly className?: string | undefined;
}) {
  const rail = useRef<HTMLUListElement>(null);

  const page = (delta: number) => {
    rail.current?.scrollBy({ left: delta * scrollBy, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div className="mb-4.5 flex justify-end gap-2.5">
        <RoundButton
          onClick={() => {
            page(-1);
          }}
          aria-label={backLabel}
          aria-controls="card-rail"
        >
          <span aria-hidden="true">←</span>
        </RoundButton>
        <RoundButton
          onClick={() => {
            page(1);
          }}
          aria-label={forwardLabel}
          aria-controls="card-rail"
        >
          <span aria-hidden="true">→</span>
        </RoundButton>
      </div>
      <ul
        ref={rail}
        id="card-rail"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {children}
      </ul>
    </div>
  );
}
