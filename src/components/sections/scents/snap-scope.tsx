"use client";

import { useEffect } from "react";

/**
 * Turns the document into a snap deck for the lifetime of /scents.
 *
 * The artboard sets `scroll-snap-type: y mandatory` on <html>, which a route
 * cannot express in the App Router — the html element belongs to the root
 * layout. Toggling a class is the smallest faithful equivalent, and it keeps
 * the sticky nav and the scrolling announcement bar behaving as drawn.
 *
 * It also keeps the deck honest about one thing CSS cannot ask. `mandatory` is
 * what makes every gesture land on a slide, but it may only stay on while the
 * slides fit the snapport: an oversized snap target cannot be snapped to
 * without leaving part of it unreachable, so the browser stops snapping through
 * the middle of it. `deck-pane` sizes a pane to the snapport, which holds at
 * every normal text size — but a pane has a floor, not a fixed height, so a
 * large accessibility text size can still push a slide's copy past the screen.
 * When that happens the deck drops to `proximity`, which lands gestures near an
 * edge and otherwise leaves the scroll alone, rather than stranding text no
 * reader could reach.
 *
 * Only the scent slides are measured. The hero and the closing band are
 * bookends, and the closing band carries the footer, so on a small phone they
 * are legitimately taller than the snapport. A browser relaxes an oversized
 * target on its own without giving up snapping for the targets that do fit, so
 * letting a bookend overflow costs nothing — whereas treating one as a failure
 * would drop all eight slides back to proximity to no purpose.
 */
export function SnapScope() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("hs-snap");

    const slides = document.querySelectorAll<HTMLElement>("[data-scent-slide]");

    /*
     * The snapport is the scrollport less the scroll padding the sticky nav
     * reserves — the same figure `deck-pane` subtracts. One pixel of slack
     * absorbs the fractional heights svh and a sticky header produce.
     */
    const sync = () => {
      const padTop = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      const snapport = window.innerHeight - padTop;
      const overflows = [...slides].some((s) => s.getBoundingClientRect().height > snapport + 1);
      root.classList.toggle("hs-snap-relaxed", overflows);
    };

    sync();
    const observer = new ResizeObserver(sync);
    for (const slide of slides) observer.observe(slide);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      root.classList.remove("hs-snap", "hs-snap-relaxed");
    };
  }, []);
  return null;
}
