"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Emblem, Eyebrow } from "@/components/primitives";
import type { Testimonial } from "@/content/home";

const AUTO_MS = 7000;
/** The artboard slows the timer once a visitor takes manual control. */
const MANUAL_MS = 9000;

export function TestimonialCarousel({ items }: { readonly items: readonly Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [interval, setIntervalMs] = useState(AUTO_MS);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length < 2) return;
    timer.current = setInterval(() => {
      go(1);
    }, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [go, interval, items.length]);

  const manual = (delta: number) => {
    setIntervalMs(MANUAL_MS);
    go(delta);
  };

  const current = items[index];
  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What our guests say"
      className="mx-auto max-w-[900px] px-6 pt-6 pb-24 text-center md:px-14"
    >
      <Emblem tone="gold" height={34} className="mx-auto opacity-85" />
      <div className="mt-8 grid grid-cols-[44px_1fr_44px] items-center gap-4 sm:gap-7">
        <button
          type="button"
          onClick={() => {
            manual(-1);
          }}
          aria-label="Previous quote"
          className="flex size-11 items-center justify-center rounded-full border border-divider text-ink transition-colors duration-300 hover:border-accent hover:text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft aria-hidden="true" size={16} />
        </button>

        <div
          className="flex min-h-[140px] flex-col justify-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={index}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="m-0"
            >
              <p className="font-heading text-[clamp(1.375rem,4vw,var(--text-title-sm))] leading-[1.3] font-normal italic">
                “{current.quote}”
              </p>
              <Eyebrow as="footer" size="md" tone="muted" className="mt-5">
                — {current.attribution}
              </Eyebrow>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => {
            manual(1);
          }}
          aria-label="Next quote"
          className="flex size-11 items-center justify-center rounded-full border border-divider text-ink transition-colors duration-300 hover:border-accent hover:text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
    </section>
  );
}
