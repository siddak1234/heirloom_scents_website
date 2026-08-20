import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/{page,layout,route,error,global-error,not-found,loading,template,default,sitemap,robots,opengraph-image,icon,apple-icon}.{ts,tsx}",
    "scripts/**/*.mjs",
    "tests/**/*.{ts,tsx}",
  ],
  project: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs", "*.{ts,mts,mjs}"],
  ignoreDependencies: [
    // Consumed by `@import "tailwindcss"` in globals.css, which knip does not follow.
    "tailwindcss",
  ],
};

export default config;
