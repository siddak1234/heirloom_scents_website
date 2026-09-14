import { z } from "zod";

const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.url(),
  locality: z.string(),
  region: z.string(),
  serviceArea: z.string(),
  email: z.email(),
  hostEmail: z.email(),
  instagram: z.string(),
  copyrightYear: z.number().int(),
  /** The dark strip above the nav on every page. */
  announcement: z.object({ notice: z.string(), cta: z.string() }),
});

/*
 * `email` and `hostEmail` are stubbed in the source artboards, which label the
 * contact block "Email & phone stubs, to confirm". They render as real content;
 * replacing them is a one-line edit here.
 *
 * `announcement.notice` names a season and a year. It is the one string on the
 * site that goes stale on a calendar — it lives here so it can be changed in
 * one place, not hunted for in markup.
 */
export const SITE = siteSchema.parse({
  name: "Heirloom Scents",
  tagline: "Memory, bottled.",
  description: "A luxury fragrance bar for weddings, celebrations & everything worth remembering.",
  url: "https://heirloomscents.com",
  locality: "Dallas",
  region: "Texas",
  serviceArea: "Dallas–Fort Worth",
  email: "hello@heirloomscents.com",
  hostEmail: "host@heirloomscents.com",
  instagram: "@heirloomscents",
  copyrightYear: 2026,
  announcement: {
    notice: "Now booking fall and winter 2026 dates",
    cta: "Book Now",
  },
});
