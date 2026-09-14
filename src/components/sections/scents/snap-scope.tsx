"use client";

import { useEffect } from "react";

/**
 * Turns the document into a snap deck for the lifetime of /scents.
 *
 * The artboard sets `scroll-snap-type: y mandatory` on <html>, which a route
 * cannot express in the App Router — the html element belongs to the root
 * layout. Toggling a class is the smallest faithful equivalent, and it keeps
 * the sticky nav and the scrolling announcement bar behaving as drawn.
 */
export function SnapScope() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("hs-snap");
    return () => {
      root.classList.remove("hs-snap");
    };
  }, []);
  return null;
}
