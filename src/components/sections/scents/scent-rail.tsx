"use client";

import { useActiveIndex } from "@/hooks/use-active-index";
import { SCENTS } from "@/content/scents";
import { pad2 } from "@/components/primitives";
import { cn } from "@/lib/cn";

/**
 * The fixed index down the right edge. It fades in only while a scent slide
 * owns the viewport, so it never floats over the hero or the closing slide.
 *
 * Hidden below `desk`, where a fixed rail 30px from the edge sits on top of the
 * slide copy. See docs/DESIGN-PARITY.md.
 */
export function ScentRail() {
  const active = useActiveIndex("[data-scent-slide]", SCENTS.length);
  const visible = active >= 0;

  const pick = (index: number) => {
    const slides = document.querySelectorAll("[data-scent-slide]");
    slides[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Scent index"
      className={cn(
        "fixed top-1/2 right-[30px] z-55 hidden -translate-y-1/2 flex-col gap-[13px] transition-opacity duration-500 desk:flex",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {SCENTS.map((scent, i) => (
        <button
          key={scent.slug}
          type="button"
          onClick={() => {
            pick(i);
          }}
          aria-label={scent.name}
          aria-current={i === active}
          className="flex cursor-pointer items-center justify-end gap-[9px] p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span
            className={cn(
              "tnum text-label-2xs tracking-meta transition-colors duration-400",
              i === active ? "text-accent" : "text-cream/70",
            )}
          >
            {pad2(i + 1)}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "block h-px transition-[width,background-color] duration-400",
              i === active ? "w-[34px] bg-accent" : "w-4 bg-cream/60",
            )}
          />
        </button>
      ))}
    </nav>
  );
}
