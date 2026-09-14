import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Covers every hand-styled action in the artboards: the hero's solid pill, the
 * outlined CTAs on both grounds, and the two `.btn btn-primary` instances the
 * design system supplies (Subscribe and Reserve).
 *
 * Per-instance padding that falls outside the three sizes is passed through
 * `className` — the artboards set it by hand and it is not a variant.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
    "border no-underline uppercase",
    "transition-colors duration-350 ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        /** Accent outline on the light ground, ink label. */
        accent: "border-accent font-body text-ink hover:bg-accent/12",
        /**
         * The system's own `.btn-primary`, which specifies the bright accent as
         * the label colour. Kept at `accent-700`: the accent measures 3.02:1 on
         * this ground and a 12–14px label needs 4.5:1. See docs/DESIGN-PARITY.md.
         */
        primary:
          "border-accent font-heading font-semibold text-accent-700 hover:bg-accent/12 active:bg-accent/22",
        /** Accent outline carrying a cream label on the night ground. */
        cream: "border-accent font-body text-cream hover:bg-accent/16",
        /** The hero's solid pill: cream ground, night label, warming to accent. */
        pill: "rounded-full border-transparent bg-cream font-body text-night hover:bg-accent",
      },
      size: {
        sm: "px-8 py-3.5 text-label-xl tracking-button",
        md: "px-9 py-[15px] text-caption-sm tracking-button",
        lg: "px-[42px] py-[18px] text-label-xl tracking-nav",
      },
    },
    defaultVariants: { variant: "accent", size: "sm" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & ButtonVariantProps;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> & ButtonVariantProps;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
