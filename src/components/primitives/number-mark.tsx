import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Tabular display numerals — "No. 01" marks and the 190px step watermarks. */
const numberMarkVariants = cva("font-heading tnum", {
  variants: {
    variant: {
      /** The scent deck's "No. 01", and the booking aside's step digits. */
      inline: "text-subtitle-sm text-accent",
      /** The combination cards' "No. 1". */
      label: "text-body-lg text-accent",
      /** The Experience steps' watermark, sitting behind the heading. */
      ghost: "pointer-events-none text-numeral leading-none text-accent/16 select-none",
    },
  },
  defaultVariants: { variant: "inline" },
});

type NumberMarkProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof numberMarkVariants>;

export function NumberMark({ className, variant, ...props }: NumberMarkProps) {
  return <span className={cn(numberMarkVariants({ variant }), className)} {...props} />;
}

/** Zero-pads to two digits, as the scent deck's marks do. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
