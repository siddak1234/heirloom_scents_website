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
});

/*
 * NOTE: `email` and `hostEmail` are stubbed in the source artboards ("Email &
 * phone stubs — to confirm"). They render as real content; replacing them is a
 * one-line edit here. docs/ASSETS.md tracks everything still standing in.
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
});
