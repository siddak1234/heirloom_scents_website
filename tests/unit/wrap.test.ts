import { describe, expect, it } from "vitest";
import { wrapIndex } from "@/lib/wrap";

/**
 * The arithmetic behind all three carousels: the two-slide hero, the
 * three-quote testimonial pager, and the four-film lightbox.
 */
describe("wrapIndex", () => {
  it("steps forward", () => {
    expect(wrapIndex(0, 1, 4)).toBe(1);
    expect(wrapIndex(2, 1, 4)).toBe(3);
  });

  it("wraps forward past the end", () => {
    expect(wrapIndex(3, 1, 4)).toBe(0);
    expect(wrapIndex(1, 1, 2)).toBe(0);
  });

  it("wraps backward past zero rather than going negative", () => {
    expect(wrapIndex(0, -1, 4)).toBe(3);
    expect(wrapIndex(0, -1, 2)).toBe(1);
    expect(wrapIndex(0, -1, 3)).toBe(2);
  });

  it("returns to the start after a full lap in either direction", () => {
    let forward = 0;
    let backward = 0;
    for (let i = 0; i < 4; i++) {
      forward = wrapIndex(forward, 1, 4);
      backward = wrapIndex(backward, -1, 4);
    }
    expect(forward).toBe(0);
    expect(backward).toBe(0);
  });

  it("never leaves the valid range", () => {
    for (let i = 0; i < 4; i++) {
      for (const delta of [-1, 1]) {
        const next = wrapIndex(i, delta, 4);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(4);
      }
    }
  });

  it("does not divide by zero on an empty ring", () => {
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
});
