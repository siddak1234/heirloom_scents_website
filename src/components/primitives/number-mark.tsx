import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Tabular display numerals — step numbers, "No. 1" marks, the 190px watermarks. */
const numberMarkVariants = cva("font-heading tnum", {
  variants: {
    variant: {
      step: "text-heading-lg text-accent-700",
      inline: "text-subtitle-sm text-accent",
      label: "text-body-lg text-accent-700",
      ghost: "text-accent/16 pointer-events-none select-none text-[190px] leading-none",
    },
  },
  defaultVariants: { variant: "step" },
});

type NumberMarkProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof numberMarkVariants>;

export function NumberMark({ className, variant, ...props }: NumberMarkProps) {
  return <span className={cn(numberMarkVariants({ variant }), className)} {...props} />;
}

/** Zero-pads to two digits, as every numbered mark in the artboards does. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
