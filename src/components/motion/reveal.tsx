"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { MotionWrapperProps } from "./types";

/** Layout effect on the client; no-op during the server render pass. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? () => undefined : useLayoutEffect;

/** Content is revealed no later than this, whatever the observer does. */
const SAFETY_MS = 4000;
const HIDDEN = ["opacity-0", "translate-y-[26px]"];

/**
 * Scroll reveal, reimplementing assets/hs-motion.js from the artboards.
 *
 * Three properties matter, and each is a bug if dropped:
 *  1. Markup renders VISIBLE. Hiding happens in a layout effect, so the page is
 *     readable without JS and crawlers never see blank sections.
 *  2. Elements already on screen are never hidden — the source's
 *     `if (r.top < innerHeight * 0.92) return` guard.
 *  3. Hiding runs before paint, so nothing flashes in and back out.
 *
 * The hidden class is toggled directly on the node rather than held in state:
 * this is a visual-only concern React does not need to re-render for, and it
 * avoids a cascading render inside a layout effect. A safety timer guarantees
 * content can never end up permanently invisible.
 */
export function Reveal({ children, className, delay = 0 }: MotionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add(...HIDDEN);
    if (delay > 0) el.style.transitionDelay = `${String(delay)}s`;

    const reveal = () => {
      el.classList.remove(...HIDDEN);
      el.style.transitionDelay = "";
      observer.disconnect();
      clearTimeout(safety);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    const safety = setTimeout(reveal, SAFETY_MS);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-950 ease-brand motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
