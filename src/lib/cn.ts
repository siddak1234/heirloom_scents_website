import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Every `--text-*` step in globals.css, as the bare utility suffix.
 *
 * tailwind-merge has to be told these, and getting it wrong is silent. Its
 * fallback for an unrecognised `text-<x>` is *colour*, so without this list it
 * reads `text-caption-sm` as a colour, finds it conflicts with `text-cream`,
 * and drops whichever came first. That deleted the label colour from every
 * button variant and shrank the 190px step watermark to the inherited 15px —
 * with no error anywhere.
 *
 * `tests/unit/cn.test.ts` fails if this list and globals.css drift apart.
 */
export const TEXT_SCALE = [
  "numeral",
  "display-2xl",
  "display-xl",
  "display-lg",
  "display-md",
  "display-sm",
  "display-xs",
  "title-xl",
  "title-lg",
  "title-md",
  "title-sm",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "heading-xs",
  "subtitle-xl",
  "subtitle-lg",
  "subtitle-md",
  "subtitle-sm",
  "subtitle-xs",
  "body-lg",
  "body-md",
  "body",
  "body-sm",
  "body-xs",
  "caption",
  "caption-sm",
  "label-xl",
  "label-lg",
  "label-md",
  "label-sm",
  "label-xs",
  "label-2xs",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TEXT_SCALE] }],
    },
  },
});

/** Compose class names, with later Tailwind utilities winning over earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
