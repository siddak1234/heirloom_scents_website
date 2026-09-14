import { cn } from "@/lib/cn";

/** The thin accent bar that wipes top-to-bottom under the hero's "Scroll" label. */
export function ScrollCue({
  label,
  className,
}: {
  readonly label: string;
  readonly className?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-[10px]", className)}>
      <span className="text-label-2xs tracking-widest text-cream/55 uppercase">{label}</span>
      <span
        aria-hidden="true"
        className="block h-[42px] w-px animate-[hs-cue_2.6s_cubic-bezier(0.45,0,0.55,1)_infinite] bg-accent motion-reduce:animate-none"
      />
    </div>
  );
}
