import { cn } from "@/lib/cn";

/**
 * The infinite band. Two identical tracks translate -50% over 36s, so the seam
 * never shows. CSS-only, so it works without JS; the reduced-motion block in
 * globals.css halts it.
 */
export function Marquee({
  items,
  className,
}: {
  readonly items: readonly string[];
  readonly className?: string | undefined;
}) {
  const track = (
    <div
      className="flex shrink-0 items-center gap-11 pr-11 text-label-md tracking-eyebrow whitespace-nowrap text-ink-65 uppercase"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span key={item} className="flex items-center gap-11">
          {item}
          <span className="text-accent">·</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("overflow-hidden border-b border-divider bg-bg py-[18px]", className)}>
      {/* The visible content is duplicated and hidden from AT; this carries the text. */}
      <span className="sr-only">{items.join(", ")}</span>
      <div className="flex w-max animate-[hs-marquee_36s_linear_infinite] motion-reduce:animate-none">
        {track}
        {track}
      </div>
    </div>
  );
}
