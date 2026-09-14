import { cn } from "@/lib/cn";

/**
 * The night ground every hero, CTA band, interlude and contact block sits on.
 * The redesign uses it fourteen times, each artboard hard-coding #1b1611.
 */
export function DarkBand({
  children,
  className,
  as: As = "section",
  id,
}: {
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
  readonly as?: "section" | "div" | "aside" | "footer";
  readonly id?: string | undefined;
}) {
  return (
    <As id={id} className={cn("relative overflow-hidden bg-night text-cream", className)}>
      {children}
    </As>
  );
}
