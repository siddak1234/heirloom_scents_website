import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Covers every hand-styled action in the artboards: the nav CTA, both hero
 * buttons, the four dark-band CTAs, and the booking Reserve button.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "border font-body uppercase no-underline",
    "transition-[background-color,border-color,color] duration-350 ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:opacity-45 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        /** Accent outline on the light ground. */
        accent: "border-accent text-accent-700 hover:bg-accent/12 active:bg-accent/22",
        /** Accent outline carrying cream type on a burgundy band. */
        cream: "border-accent text-cream hover:bg-accent/16 active:bg-accent/24",
        /** Quiet secondary on a burgundy band — border lifts to accent on hover. */
        muted: "border-cream-30 text-cream-80 hover:border-accent hover:text-cream",
      },
      size: {
        sm: "px-5 py-[11px] text-label-md tracking-nav",
        md: "px-[34px] py-[15px] text-body-xs tracking-button",
        lg: "px-11 py-4 text-body-xs tracking-link",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
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
