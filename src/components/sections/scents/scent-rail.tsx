"use client";

import { pad2 } from "@/components/primitives";
import { useActiveIndex } from "@/hooks/use-active-index";
import { SCENTS } from "@/content/scents";
import { cn } from "@/lib/cn";

const SLIDE_SELECTOR = "[data-scent-slide]";

/** The fixed right-hand index that tracks the active slide. */
export function ScentRail() {
  const active = useActiveIndex(SLIDE_SELECTOR, SCENTS.length);
  const visible = active >= 0;

  const jump = (index: number) => {
    const node = document.querySelectorAll(SLIDE_SELECTOR)[index];
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Scent index"
      className={cn(
        "fixed top-1/2 right-7 z-55 hidden -translate-y-1/2 flex-col gap-[13px] transition-opacity duration-500 lg:flex",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {SCENTS.map((scent, i) => (
        <button
          key={scent.slug}
          type="button"
          onClick={() => {
            jump(i);
          }}
          title={scent.name}
          aria-label={`Go to ${scent.name}`}
          {...(i === active ? { "aria-current": "true" as const } : {})}
          className="flex cursor-pointer items-center justify-end gap-[9px] border-none bg-transparent p-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span
            className={cn(
              "tnum text-label-xs tracking-meta transition-colors duration-400",
              i === active ? "text-accent" : "text-cream-60",
            )}
          >
            {pad2(i + 1)}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "block h-px transition-[width,background-color] duration-400",
              i === active ? "w-[34px] bg-accent" : "w-4 bg-cream-30",
            )}
          />
        </button>
      ))}
    </nav>
  );
}
