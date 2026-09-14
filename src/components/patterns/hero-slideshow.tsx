"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ButtonLink, RoundButton } from "@/components/primitives";
import { type HeroSlide } from "@/content/home";
import { image } from "@/content/media-manifest";
import { cn } from "@/lib/cn";
import { wrapIndex } from "@/lib/wrap";

const AUTO_MS = 6500;
/** The artboard slows the timer once a visitor takes manual control. */
const MANUAL_MS = 9000;
/** Copy fades out, the slide changes, copy fades back in. */
const FADE_MS = 450;

/** One slide's three-panel filmstrip. The outer panels are hidden below `desk`. */
function Filmstrip({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const panels = [
    { key: slide.left, edge: true },
    { key: slide.center, edge: false },
    { key: slide.right, edge: true },
  ];
  return (
    <div className="grid h-full grid-cols-1 desk:grid-cols-[1fr_1.25fr_1fr]">
      {panels.map((panel, i) => {
        const asset = image(panel.key);
        return (
          <div
            key={`${panel.key}-${String(i)}`}
            className={cn("relative min-w-0 overflow-hidden", panel.edge && "hidden desk:block")}
          >
            <Image
              src={asset.src}
              alt=""
              aria-hidden="true"
              fill
              priority={priority && !panel.edge}
              sizes="(max-width: 860px) 100vw, 40vw"
              className={cn(
                "object-cover object-center",
                panel.edge ? "brightness-50" : "brightness-[0.62]",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HeroSlideshow({ slides }: { readonly slides: readonly HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [intervalMs, setIntervalMs] = useState(AUTO_MS);
  const fade = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: (current: number) => number) => {
    setVisible(false);
    if (fade.current) clearTimeout(fade.current);
    fade.current = setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, FADE_MS);
  }, []);

  const advance = useCallback(
    (delta: number) => {
      goTo((i) => wrapIndex(i, delta, slides.length));
    },
    [goTo, slides.length],
  );

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      advance(1);
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [advance, intervalMs, slides.length]);

  useEffect(
    () => () => {
      if (fade.current) clearTimeout(fade.current);
    },
    [],
  );

  const current = slides[index];
  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Heirloom Scents"
      className="relative h-[78vh] min-h-[520px] overflow-hidden bg-night text-cream"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          aria-hidden={i !== index}
          className="absolute inset-0 transition-opacity duration-1200 ease-brand"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Filmstrip slide={slide} priority={i === 0} />
        </div>
      ))}

      <div className="absolute inset-0 bg-linear-to-b from-veil/28 to-veil/50" />

      <div
        aria-live="polite"
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-450 desk:px-[90px]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-label-lg tracking-widest text-cream uppercase">{current.kicker}</p>
        <h1 className="mt-[22px] max-w-[900px] font-heading text-title-lg leading-[1.02] font-normal tracking-[0.06em] text-cream uppercase desk:text-display-xl">
          {current.title}
        </h1>
        <p className="mt-[22px] max-w-[520px] text-body-lg/[1.75] text-cream/90">{current.blurb}</p>
        <ButtonLink href={current.href} variant="pill" size="lg" className="mt-[34px]">
          {current.cta}
        </ButtonLink>
      </div>

      <RoundButton
        tone="hero"
        size={52}
        onClick={() => {
          setIntervalMs(MANUAL_MS);
          advance(-1);
        }}
        aria-label="Previous slide"
        className="absolute top-1/2 left-8 -translate-y-1/2"
      >
        <span aria-hidden="true">←</span>
      </RoundButton>

      <RoundButton
        tone="hero"
        size={52}
        onClick={() => {
          setIntervalMs(MANUAL_MS);
          advance(1);
        }}
        aria-label="Next slide"
        className="absolute top-1/2 right-8 -translate-y-1/2"
      >
        <span aria-hidden="true">→</span>
      </RoundButton>

      <div className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => {
              setIntervalMs(MANUAL_MS);
              goTo(() => i);
            }}
            aria-label={`Go to slide ${String(i + 1)}`}
            aria-current={i === index}
            className={cn(
              "h-[3px] w-14 cursor-pointer transition-colors duration-400",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              i === index ? "bg-accent" : "bg-cream/35",
            )}
          />
        ))}
      </div>
    </section>
  );
}
