/**
 * The handful of brand values that JavaScript APIs need as literals — the
 * viewport themeColor and OG image rendering cannot read a CSS custom property.
 *
 * This file is the single JS-side mirror of the token layer in globals.css.
 * Keep the two in step; nothing else in src/ may hold a raw colour.
 */
export const BRAND_HEX = {
  bg: "#f3f2f2",
  ink: "#201f1d",
  accent: "#b68235",
  burgundy: "#400d15",
  cream: "#f1e8da",
} as const;
