"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundVideo, PlateFrame, RoundButton } from "@/components/primitives";
import { video, type VideoKey } from "@/content/media-manifest";
import { wrapIndex } from "@/lib/wrap";

/**
 * The events page's film library: four silent 9/16 loops that open a player
 * with sound.
 *
 * The artboard's lightbox is a plain div. This one is a real dialog — labelled,
 * modal, focus-trapped, and returning focus to the tile that opened it — which
 * the artboard has no way to express. See docs/DESIGN-PARITY.md.
 */
export function FilmGrid({ reels }: { readonly reels: readonly VideoKey[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const invoker = useRef<number | null>(null);

  const close = () => {
    setOpen(null);
    const i = invoker.current;
    if (i !== null) tiles.current[i]?.focus();
  };

  useEffect(() => {
    if (open === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = dialog.current?.querySelectorAll<HTMLElement>("button, video[controls]");
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const step = (delta: number) => {
    setOpen((i) => (i === null ? null : wrapIndex(i, delta, reels.length)));
  };

  const current = open === null ? null : reels[open];

  return (
    <>
      <ul className="grid grid-cols-2 gap-5 desk:grid-cols-4">
        {reels.map((reel, i) => (
          <li key={reel}>
            <PlateFrame ratio="9/16" className="bg-night transition-shadow hover:shadow-md">
              <button
                ref={(node) => {
                  tiles.current[i] = node;
                }}
                type="button"
                onClick={() => {
                  invoker.current = i;
                  setOpen(i);
                }}
                aria-label={`Play film ${String(i + 1)} of ${String(reels.length)} with sound`}
                className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <BackgroundVideo src={reel} preload="none" className="pointer-events-none" />
                <span
                  aria-hidden="true"
                  className="absolute right-3 bottom-3 flex size-[38px] items-center justify-center rounded-full border border-cream/70 bg-veil/45 text-body-xs text-cream"
                >
                  ▶
                </span>
              </button>
            </PlateFrame>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`Film ${String((open ?? 0) + 1)} of ${String(reels.length)}`}
          onClick={(event) => {
            /* Only the backdrop itself closes — a click on the player must not. */
            if (event.target === event.currentTarget) close();
          }}
          className="fixed inset-0 z-200 flex items-center justify-center gap-7 bg-veil-deep/93 p-6"
        >
          <RoundButton
            tone="on-dark"
            size={46}
            onClick={() => {
              step(-1);
            }}
            aria-label="Previous film"
          >
            <span aria-hidden="true">←</span>
          </RoundButton>

          <div className="relative aspect-9/16 h-[min(86vh,780px)] max-w-[80vw]">
            {/* No captions: the reels carry no dialogue, only a music bed. */}
            <video
              key={current}
              src={video(current).src}
              poster={video(current).poster}
              controls
              autoPlay
              playsInline
              className="block h-full w-full bg-black object-contain shadow-lg"
            />
            <RoundButton
              tone="close"
              size={40}
              onClick={close}
              aria-label="Close"
              className="absolute -top-[18px] -right-[18px]"
            >
              <span aria-hidden="true">✕</span>
            </RoundButton>
          </div>

          <RoundButton
            tone="on-dark"
            size={46}
            onClick={() => {
              step(1);
            }}
            aria-label="Next film"
          >
            <span aria-hidden="true">→</span>
          </RoundButton>
        </div>
      ) : null}
    </>
  );
}
