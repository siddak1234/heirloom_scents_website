"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which slide currently owns the viewport centre.
 *
 * The artboard did this with a scroll listener that called getBoundingClientRect()
 * on all eight slides every frame. An IntersectionObserver gives identical
 * behaviour and does the work off the main thread.
 */
export function useActiveIndex(selector: string, count: number): number {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (nodes.length === 0) return;

    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
        let best = -1;
        let bestRatio = 0;
        nodes.forEach((node, i) => {
          const r = ratios.get(node) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        setActive(bestRatio > 0.5 ? best : -1);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const node of nodes) observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [selector, count]);

  return active;
}
