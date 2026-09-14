import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { cn, TEXT_SCALE } from "@/lib/cn";

/**
 * tailwind-merge's fallback for an unrecognised `text-<x>` is colour, so a
 * custom font-size scale it has not been told about silently eats the colour
 * class beside it. These are the cases that were actually broken.
 */
describe("cn", () => {
  it("keeps a size and a colour together", () => {
    expect(cn("text-cream", "text-caption-sm")).toBe("text-cream text-caption-sm");
    expect(cn("text-ink", "text-label-xl")).toBe("text-ink text-label-xl");
    expect(cn("text-numeral", "text-accent/16")).toBe("text-numeral text-accent/16");
  });

  it("still lets a later size beat an earlier size", () => {
    expect(cn("text-body-lg", "text-display-xl")).toBe("text-display-xl");
    expect(cn("text-label-md", "text-label-2xs")).toBe("text-label-2xs");
  });

  it("still lets a later colour beat an earlier colour", () => {
    expect(cn("text-ink", "text-accent-700")).toBe("text-accent-700");
    expect(cn("text-cream/62", "text-cream")).toBe("text-cream");
  });

  it("keeps a size with a line-height modifier intact beside a colour", () => {
    expect(cn("text-body-md/[1.9]", "text-ink/78")).toBe("text-body-md/[1.9] text-ink/78");
  });
});

describe("the text scale and globals.css agree", () => {
  it("declares every --text-* token, and no token that no longer exists", () => {
    const css = readFileSync("src/styles/globals.css", "utf8");
    const declared = [...css.matchAll(/^\s*--text-([a-z0-9-]+):/gm)].map((m) => m[1]);
    expect(declared.length, "globals.css should declare a type scale").toBeGreaterThan(0);
    expect([...TEXT_SCALE].sort()).toEqual([...declared].sort());
  });
});
