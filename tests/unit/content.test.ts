import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { SCENTS, SCENT_NAMES, slideGradient } from "@/content/scents";
import { COMBINATIONS, HERO_SLIDES, TESTIMONIALS, VALUE_PROPS } from "@/content/home";
import { EVENT_TYPES, EXPERIENCE_STEPS, INCLUDED, REELS } from "@/content/pages";
import { IMAGES, VIDEOS } from "@/content/media-manifest";

describe("scent library", () => {
  /*
   * Deliberately not a fixed count. The library is a showcase, not a closed
   * catalogue, so adding a scent must not fail the suite — what has to hold is
   * that every "No. NN" mark matches the slide's actual place in the deck.
   */
  it("numbers every scent by its position in the deck", () => {
    expect(SCENTS.length).toBeGreaterThan(0);
    expect(SCENTS.map((s) => s.index)).toEqual(SCENTS.map((_, i) => i + 1));
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

  it("keeps the two anchors the artboard names", () => {
    const anchors = SCENTS.filter((s) => s.anchor).map((s) => s.anchor);
    expect(anchors).toEqual(["golds", "florals"]);
  });

  it("builds each slide gradient on the scent's own base, with the shared stops", () => {
    const gradient = slideGradient("25,10,6");
    expect(gradient).toBe(
      "linear-gradient(90deg, rgba(25,10,6,0.86) 0%, rgba(25,10,6,0.62) 40%, " +
        "rgba(25,10,6,0.1) 68%, rgba(25,10,6,0.22) 100%)",
    );
  });
});

describe("media manifest", () => {
  it("points at files that exist on disk with real dimensions", () => {
    for (const [key, asset] of Object.entries(IMAGES)) {
      expect(existsSync(`public${asset.src}`), `${key} missing on disk`).toBe(true);
      expect(asset.width, `${key} width`).toBeGreaterThan(0);
      expect(asset.height, `${key} height`).toBeGreaterThan(0);
    }
  });

  it("ships a poster beside every reel", () => {
    for (const [key, asset] of Object.entries(VIDEOS)) {
      expect(existsSync(`public${asset.src}`), `${key} missing on disk`).toBe(true);
      expect(existsSync(`public${asset.poster}`), `${key} poster missing on disk`).toBe(true);
      expect(asset.width, `${key} width`).toBeGreaterThan(0);
      expect(asset.height, `${key} height`).toBeGreaterThan(0);
    }
  });

  it("is referenced by every content module that names an asset", () => {
    const images = new Set(Object.keys(IMAGES));
    const videos = new Set(Object.keys(VIDEOS));
    for (const s of SCENTS) expect(images).toContain(s.image);
    for (const e of EVENT_TYPES) expect(images).toContain(e.image);
    for (const s of EXPERIENCE_STEPS) expect(images).toContain(s.image);
    for (const slide of HERO_SLIDES) {
      expect(images).toContain(slide.left);
      expect(images).toContain(slide.center);
      expect(images).toContain(slide.right);
    }
    for (const reel of REELS) expect(videos).toContain(reel);
  });
});

describe("page content", () => {
  it("carries the counts the artboards show", () => {
    expect(HERO_SLIDES).toHaveLength(2);
    expect(COMBINATIONS).toHaveLength(4);
    expect(VALUE_PROPS).toHaveLength(3);
    expect(TESTIMONIALS).toHaveLength(3);
    expect(EVENT_TYPES).toHaveLength(4);
    expect(EXPERIENCE_STEPS).toHaveLength(3);
    expect(INCLUDED).toHaveLength(4);
    expect(REELS).toHaveLength(4);
  });

  it("numbers the combinations 1 to 4", () => {
    expect(COMBINATIONS.map((c) => c.no)).toEqual([1, 2, 3, 4]);
  });

  it("names only real scents in every combination", () => {
    for (const combination of COMBINATIONS) {
      for (const name of combination.notes.split(" · ")) {
        expect(SCENT_NAMES, `"${combination.name}" names unknown "${name}"`).toContain(name);
      }
    }
  });

  it("sends both hero slides somewhere real", () => {
    for (const slide of HERO_SLIDES) expect(slide.href).toMatch(/^\/[a-z]*$/);
  });

  it("links only step one, as the artboard does", () => {
    expect(EXPERIENCE_STEPS.filter((s) => s.link)).toHaveLength(1);
    expect(EXPERIENCE_STEPS[0]?.link?.href).toBe("/scents");
  });
});
