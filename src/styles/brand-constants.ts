/**
 * The JS-side mirror of the token layer in globals.css, for the one place a
 * JavaScript API needs a literal: `viewport.themeColor` cannot read a CSS
 * custom property.
 *
 * Only values with a live consumer belong here. Nothing else in src/ may hold
 * a raw colour — `npm run audit:tokens` fails the build if it does.
 */
export const BRAND_HEX = {
  /** --color-bg. The page ground, and so the browser chrome colour. */
  bg: "#f3f2f2",
} as const;
