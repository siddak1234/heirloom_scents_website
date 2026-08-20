import { cn } from "@/lib/cn";

/**
 * The burgundy ground every hero, CTA band, interlude and contact block sits on.
 * Twelve instances in the artboards, each previously hard-coding #400d15.
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
    <As id={id} className={cn("relative overflow-hidden bg-burgundy text-cream", className)}>
      {children}
    </As>
  );
}
