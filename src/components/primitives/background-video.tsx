"use client";

import { useEffect, useRef } from "react";
import { video, type VideoKey } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

/**
 * A silent looping reel behind content. Six instances: the home video band, the
 * events hero, and the four films in the events grid.
 *
 * The artboards force playback with a 900ms interval that re-mutes and
 * re-plays every background video. That is a workaround for the design canvas's
 * preview frame, not a production requirement, and it is not reproduced here.
 * Instead:
 *
 *  - `autoPlay` is never set. Playback starts from an effect, so the server
 *    renders the poster frame and the page is correct before JS arrives.
 *  - `muted` is assigned on the node. The autoplay policy only exempts muted
 *    video, and React's `muted` prop does not reliably reach the element.
 *  - Reduced motion keeps the poster and never plays.
 *  - Playback follows the viewport, so four reels on the events page do not all
 *    decode at once.
 */
export function BackgroundVideo({
  src,
  className,
  opacity,
  preload = "metadata",
}: {
  readonly src: VideoKey;
  readonly className?: string | undefined;
  readonly opacity?: number | undefined;
  /** "none" for the four grid tiles, which must not fetch until they are near. */
  readonly preload?: "none" | "metadata";
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.muted = true;
    const play = () => {
      void el.play().catch(() => undefined);
    };

    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play();
          else el.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const asset = video(src);
  return (
    <video
      ref={ref}
      src={asset.src}
      poster={asset.poster}
      width={asset.width}
      height={asset.height}
      muted
      loop
      playsInline
      preload={preload}
      aria-hidden="true"
      tabIndex={-1}
      className={cn("h-full w-full object-cover", className)}
      style={opacity === undefined ? undefined : { opacity }}
    />
  );
}
