import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { SCENTS, SCENT_NAMES } from "@/content/scents";
import { COMBINATIONS, GALLERY, HOME_STEPS, TESTIMONIALS } from "@/content/home";
import { EVENT_TYPES, EXPERIENCE_STEPS, INCLUDED } from "@/content/pages";
import { IMAGES } from "@/content/image-manifest";

describe("scent library", () => {
  it("has the eight scents in order", () => {
    expect(SCENTS).toHaveLength(8);
    expect(SCENTS.map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("uses unique slugs", () => {
    expect(new Set(SCENTS.map((s) => s.slug)).size).toBe(SCENTS.length);
  });

  it("only pairs scents that exist", () => {
    for (const scent of SCENTS) {
      for (const pairing of scent.pairings) {
        expect(SCENT_NAMES, `${scent.name} pairs with unknown "${pairing}"`).toContain(pairing);
      }
    }
  });

  it("never pairs a scent with itself", () => {
    for (const scent of SCENTS) expect(scent.pairings).not.toContain(scent.name);
  });

  it("keeps the anchors the home page links to", () => {
    const anchors = SCENTS.filter((s) => s.anchor).map((s) => s.anchor);
    expect(anchors).toContain("golds");
    expect(anchors).toContain("florals");
  });
});

describe("image manifest", () => {
  it("points at files that exist on disk with real dimensions", () => {
    for (const [key, asset] of Object.entries(IMAGES)) {
      expect(existsSync(`public${asset.src}`), `${key} missing on disk`).toBe(true);
      expect(asset.width, `${key} width`).toBeGreaterThan(0);
      expect(asset.height, `${key} height`).toBeGreaterThan(0);
    }
  });

  it("is referenced by every content module that names an image", () => {
    const keys = new Set(Object.keys(IMAGES));
    for (const s of SCENTS) expect(keys).toContain(s.image);
    for (const g of GALLERY) expect(keys).toContain(g.image);
    for (const e of EVENT_TYPES) expect(keys).toContain(e.image);
    for (const s of EXPERIENCE_STEPS) expect(keys).toContain(s.image);
  });
});

describe("page content", () => {
  it("carries the counts the artboards show", () => {
    expect(COMBINATIONS).toHaveLength(4);
    expect(HOME_STEPS).toHaveLength(4);
    expect(TESTIMONIALS).toHaveLength(3);
    expect(EVENT_TYPES).toHaveLength(4);
    expect(EXPERIENCE_STEPS).toHaveLength(3);
    expect(INCLUDED).toHaveLength(4);
  });

  it("links every combination to a real scent anchor", () => {
    const anchors = new Set(SCENTS.map((s) => s.anchor).filter(Boolean));
    for (const c of COMBINATIONS) expect(anchors).toContain(c.anchor);
  });
});
