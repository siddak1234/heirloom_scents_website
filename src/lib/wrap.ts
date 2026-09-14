/**
 * Step an index around a ring, in either direction.
 *
 * Three carousels need this — the hero slideshow, the testimonial pager and the
 * film lightbox — and all three artboards write the same
 * `(i + d + length) % length`. The `+ length` is what makes a backward step
 * from zero land on the last item instead of returning a negative index.
 */
export function wrapIndex(current: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}
