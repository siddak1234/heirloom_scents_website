import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * The circular glyph button. Twelve instances across the artboards: the hero's
 * slide arrows, the scent rail's pager, the testimonial pager, the film
 * lightbox's navigation and close, and the booking calendar's month arrows.
 *
 * The glyph is a text arrow (←, →, ✕), exactly as the artboards set it — they
 * use no icon font and no icon library.
 */
const roundButtonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border",
    "transition-colors duration-300",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-35",
  ],
  {
    variants: {
      tone: {
        /** On the light ground: rails, testimonial, calendar months. */
        light: "border-divider bg-transparent text-ink hover:border-accent hover:text-accent-700",
        /** On the night ground: the film lightbox's prev and next. */
        "on-dark":
          "border-cream/50 bg-transparent text-cream hover:border-accent hover:text-accent",
        /** Over the hero's imagery, where the glyph needs its own ground. */
        hero: "border-cream/60 bg-veil/30 text-cream hover:border-accent hover:text-accent",
        /** The lightbox's close, which sits half off the player's corner. */
        close: "border-cream/60 bg-night text-cream hover:border-accent hover:text-accent",
      },
      size: {
        32: "size-8 text-body-xs",
        40: "size-10 text-body-lg",
        44: "size-11 text-subtitle-xs",
        46: "size-[46px] text-subtitle-xs",
        52: "size-13 text-subtitle-sm",
      },
    },
    defaultVariants: { tone: "light", size: 44 },
  },
);

type RoundButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof roundButtonVariants>;

export function RoundButton({ className, tone, size, ...props }: RoundButtonProps) {
  return (
    <button
      type="button"
      className={cn(roundButtonVariants({ tone, size }), className)}
      {...props}
    />
  );
}
