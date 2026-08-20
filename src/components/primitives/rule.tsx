import { cn } from "@/lib/cn";

/** The hairline divider that carries structure in the classical system. */
export function Rule({ className }: { readonly className?: string | undefined }) {
  return <hr className={cn("h-px border-0 bg-divider", className)} />;
}
