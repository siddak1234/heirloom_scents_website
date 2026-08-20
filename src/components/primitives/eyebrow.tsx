import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** The uppercase accent kicker — fifteen instances across the artboards. */
const eyebrowVariants = cva("uppercase", {
  variants: {
    size: {
      lg: "text-label-md tracking-eyebrow",
      md: "text-label-sm tracking-nav",
      sm: "text-label-xs tracking-widest",
    },
    tone: {
      /**
       * Deliberately the deep ramp step, not --color-accent.
       *
       * The accent measures 3.02:1 on the light ground — enough for icons and
       * display type, short of the 4.5:1 that 11px label text needs. The
       * classical readme prescribes exactly this substitution: "for paragraph-size
       * text in the accent use a deep ramp step (--color-accent-700 on this
       * ground) rather than the accent itself."
       */
      accent: "text-accent-700",
      /** The bright accent, for burgundy bands where it measures 4.85:1. */
      "on-dark": "text-accent",
      cream: "text-cream-60",
      muted: "text-ink-65",
    },
  },
  defaultVariants: { size: "lg", tone: "accent" },
});

type EyebrowProps = React.ComponentPropsWithoutRef<"p"> &
  VariantProps<typeof eyebrowVariants> & {
    /** The kicker is sometimes a quote attribution, which belongs in a footer. */
    readonly as?: "p" | "footer" | "span" | "div";
  };

export function Eyebrow({ className, size, tone, as: As = "p", ...props }: EyebrowProps) {
  return <As className={cn(eyebrowVariants({ size, tone }), className)} {...props} />;
}
