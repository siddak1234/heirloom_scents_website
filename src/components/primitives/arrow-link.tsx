import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** The underlined "Read the scent library →" pattern — eight instances in the artboards. */
const arrowLinkVariants = cva(
  [
    "inline-block border-b pb-[7px] uppercase no-underline",
    "transition-colors duration-300 ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ],
  {
    variants: {
      variant: {
        accent: "border-accent text-accent-700 hover:text-accent-600",
        cream: "border-accent text-cream-85 hover:text-accent",
      },
      size: {
        md: "text-label-lg tracking-button",
        sm: "text-label-sm tracking-link",
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
