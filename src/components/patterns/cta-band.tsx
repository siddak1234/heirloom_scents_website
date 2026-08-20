import { ActionRow, DarkBand } from "@/components/layout";
import { Emblem } from "@/components/primitives";
import { cn } from "@/lib/cn";

/**
 * The burgundy call-to-action band. Four instances in the artboards — the home
 * events band, the experience close, the events close, and the /scents finale.
 */
export function CtaBand({
  heading,
  blurb,
  emblemHeight,
  chips,
  children,
  className,
  headingSize = "md",
  id,
}: {
  readonly heading: string;
  readonly blurb?: string | undefined;
  readonly emblemHeight?: number | undefined;
  readonly chips?: readonly string[] | undefined;
  readonly children?: React.ReactNode;
  readonly className?: string | undefined;
  readonly headingSize?: "sm" | "md";
  readonly id?: string | undefined;
}) {
  return (
    <DarkBand id={id} className={cn("px-6 py-18 text-center md:px-14", className)}>
      <div className="mx-auto flex max-w-prose flex-col items-center">
        {chips ? (
          <ul className="mb-7 flex flex-wrap justify-center gap-[14px] text-label-md tracking-nav text-cream-60 uppercase">
            {chips.map((chip, i) => (
              <li key={chip} className="flex items-center gap-[14px]">
                {chip}
                {i < chips.length - 1 ? <span className="text-accent">·</span> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {emblemHeight ? <Emblem tone="cream" height={emblemHeight} className="opacity-90" /> : null}

        <h2
          className={cn(
            "mt-6 font-heading leading-[1.1] font-normal text-cream",
            headingSize === "md"
              ? "text-[clamp(2rem,5vw,var(--text-title-xl))]"
              : "text-[clamp(1.75rem,4.5vw,var(--text-title-md))]",
          )}
        >
          {heading}
        </h2>

        {blurb ? (
          <p className="mt-4 max-w-blurb text-body-sm/[1.8] text-cream-60">{blurb}</p>
        ) : null}

        {children ? <ActionRow className="mt-9">{children}</ActionRow> : null}
      </div>
    </DarkBand>
  );
}
