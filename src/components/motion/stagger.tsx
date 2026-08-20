import { cn } from "@/lib/cn";
import type { MotionWrapperProps } from "./types";

/**
 * The hero entrance. The artboards drive this with per-element animation-delay
 * (0.1s → 1.1s); the same cadence here, as a pure CSS animation, so the hero
 * needs no client JS at all and renders on the server.
 *
 * Reduced motion is handled by the global block in globals.css, which zeroes both
 * duration AND delay. A `motion-reduce:` utility would be inert here — inline
 * styles outrank it.
 */
export function FadeUp({ children, className, delay = 0 }: MotionWrapperProps) {
  return (
    <div
      className={cn(className)}
      style={{
        animationName: "hs-fade-up",
        animationDuration: "1.1s",
        animationTimingFunction: "cubic-bezier(0.22,0.61,0.36,1)",
        animationDelay: `${String(delay)}s`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
