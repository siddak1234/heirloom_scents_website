"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow, Mark, RoundButton } from "@/components/primitives";
import { HOME_COPY, type Testimonial } from "@/content/home";
import { wrapIndex } from "@/lib/wrap";

const AUTO_MS = 7000;
/** The artboard slows the timer once a visitor takes manual control. */
const MANUAL_MS = 9000;
/** The artboard fades out, swaps, then fades in. */
const FADE_MS = 450;

export function TestimonialCarousel({ items }: { readonly items: readonly Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [intervalMs, setIntervalMs] = useState(AUTO_MS);
  const fade = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (delta: number) => {
      setVisible(false);
      if (fade.current) clearTimeout(fade.current);
      fade.current = setTimeout(() => {
        setIndex((i) => wrapIndex(i, delta, items.length));
        setVisible(true);
      }, FADE_MS);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      go(1);
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [go, intervalMs, items.length]);

  useEffect(
    () => () => {
      if (fade.current) clearTimeout(fade.current);
    },
    [],
  );

  const manual = (delta: number) => {
    setIntervalMs(MANUAL_MS);
    go(delta);
  };

  const current = items[index];
  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={HOME_COPY.testimonialLabel}
      className="mx-auto max-w-[900px] px-6 pb-28 text-center desk:px-14"
    >
      <Mark height={40} className="mx-auto" />
      <div className="mt-7.5 grid grid-cols-[44px_1fr_44px] items-center gap-4 desk:gap-7">
        <RoundButton
          onClick={() => {
            manual(-1);
          }}
          aria-label="Previous quote"
          aria-controls="testimonial-quote"
        >
          <span aria-hidden="true">←</span>
        </RoundButton>

        <div
          id="testimonial-quote"
          aria-live="polite"
          className="flex min-h-[140px] flex-col justify-center transition-opacity duration-450"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <blockquote className="font-heading text-heading-xl leading-[1.3] font-normal italic">
            {`“${current.quote}”`}
          </blockquote>
          <Eyebrow as="footer" size="md" tone="muted" className="mt-5">
            {`— ${current.attribution}`}
          </Eyebrow>
        </div>

        <RoundButton
          onClick={() => {
            manual(1);
          }}
          aria-label="Next quote"
          aria-controls="testimonial-quote"
        >
          <span aria-hidden="true">→</span>
        </RoundButton>
      </div>
    </section>
  );
}
