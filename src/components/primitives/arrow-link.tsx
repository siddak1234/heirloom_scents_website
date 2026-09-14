import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** The underlined "About Us →" pattern — six instances in the artboards. */
const arrowLinkVariants = cva(
  [
    "inline-block border-b uppercase no-underline",
    "transition-colors duration-300 ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ],
  {
    variants: {
      variant: {
        accent: "border-accent text-accent-700 hover:text-accent-800",
        cream: "border-accent text-cream/85 hover:text-accent",
      },
      size: {
        md: "pb-[7px] text-label-xl tracking-button",
        sm: "pb-1.5 text-label-lg tracking-button",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  },
);

type ArrowLinkProps = React.ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof arrowLinkVariants> & { readonly showArrow?: boolean };

export function ArrowLink({
  className,
  variant,
  size,
  showArrow = true,
  children,
  ...props
}: ArrowLinkProps) {
  return (
    <Link className={cn(arrowLinkVariants({ variant, size }), className)} {...props}>
      {children}
      {showArrow ? <span aria-hidden="true">{"  →"}</span> : null}
    </Link>
  );
}
