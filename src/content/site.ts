import { z } from "zod";

const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.url(),
  locality: z.string(),
  region: z.string(),
  serviceArea: z.string(),
  instagram: z.string(),
  copyrightYear: z.number().int(),
  /** The dark strip above the nav on every page. */
  announcement: z.object({ notice: z.string(), cta: z.string() }),
});

/*
 * There is deliberately no contact address at all. The artboards showed
 * `hello@heirloomscents.com` under a note reading "Email & phone stubs, to
 * confirm"; that mailbox does not exist, so it is not displayed anywhere, and
 * the scheduler now handles the one place mail was needed. Instagram and the
 * booking link are the two contact routes that work.
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
  instagram: "@heirloomscents",
  copyrightYear: 2026,
  announcement: {
    notice: "Now booking fall and winter 2026 dates",
    cta: "Book Now",
  },
});
