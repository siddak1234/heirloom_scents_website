# Design parity

Every intentional deviation from the Claude Design artboards, with its reason.
Nothing here is an oversight — do not "fix" these back.

Source: project `0c4ed435-1fea-4231-b2f2-a1c0a0df68bf`, `classical` design system.

## Accessibility

| Artboard                                                         | Implementation                 | Why                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow labels in `--color-accent` (#b68235) on the light ground | `--color-accent-700` (#7d5411) | The accent measures **3.02:1** on #f3f2f2 — short of the 4.5:1 that 11px label text requires. The `classical` readme prescribes exactly this: _"for paragraph-size text in the accent use a deep ramp step (`--color-accent-700` on this ground) rather than the accent itself."_ On burgundy bands the bright accent measures 4.85:1 and is kept (`tone="on-dark"`). |
| Muted text at 45% and 55% ink                                    | 65% ink                        | 2.74:1 and 3.63:1 respectively. 65% measures 4.90:1.                                                                                                                                                                                                                                                                                                                  |
| `#f1e8da` at 50% on burgundy                                     | 60%                            | 4.19:1 → 5.50:1.                                                                                                                                                                                                                                                                                                                                                      |
| Hand-rolled calendar button grid                                 | `@daypicker/react`             | The artboard's grid has no ARIA grid semantics and no keyboard navigation. Styled to match the original exactly.                                                                                                                                                                                                                                                      |
| No skip link                                                     | Skip link to `#main`           | Keyboard users otherwise tab the whole nav on every page.                                                                                                                                                                                                                                                                                                             |

All six routes pass axe at WCAG 2.2 AA with zero violations.

## Responsive

The artboards are desktop-only — fixed px, two-column grids, no media queries.
Desktop at 1440px is pixel-faithful; everything below is derived from the design
language.

- Nav collapses to a drawer below `lg`; the wordmark drops below 380px.
- Every `1.1fr 1fr` / `repeat(2,…)` grid stacks below `lg`. The four-column
  "includes" row goes 4 → 2 → 1.
- Display type moves to `clamp()` on the type scale; the 96px hero floors at 3rem.
- Section gutter 56px → 24px below `md`.
- **`/scents`**: the mandatory scroll-snap deck is kept at `lg` and above. Below
  that it becomes a normal vertical stack of full-bleed cards, and the index rail
  is hidden — a mandatory snap container on a phone traps the scroll.
- Booking's split becomes stacked, aside first.

## Behaviour

| Artboard                                                                                    | Implementation                                                         | Why                                                                                              |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Availability from `hash(iso) % 7`                                                           | Real trading rules (closed Sun & Mon, no same-day, three months ahead) | The hash was a mock. Rules live in `src/features/booking/lib/availability.ts`.                   |
| "Calendar invite sent" is a static screen                                                   | Real validation, `.ics` generation, and a persistence seam             | Sending is pending Supabase and Resend — see `docs/DEPLOYMENT.md`.                               |
| Rail position from a scroll listener calling `getBoundingClientRect()` on 8 nodes per frame | `IntersectionObserver`                                                 | Identical behaviour, off the main thread.                                                        |
| Hover tints at 12% / 16% / 18%                                                              | 12% (light) and 16% (dark)                                             | Three near-identical values collapsed into the button variants. The difference is imperceptible. |
| `<image-slot>` drag-drop placeholders                                                       | `next/image`                                                           | The slot was a design-canvas scaffold, not a production component.                               |

## Type and colour

The artboards use **29 distinct font sizes** and **28 ad-hoc `color-mix()` alpha
percentages** inline. These are collapsed into named scales in `globals.css`
(`--text-*`, `--color-ink-*`, `--color-cream-*`). Rendered sizes are unchanged;
only the source of the value moved.

`scripts/audit-tokens.mjs` fails the build if a raw hex or `rgba()` appears
outside the token layer.

## Imagery

20 of the 23 referenced images are **dimension-accurate placeholders**, not the
source photographs — see `docs/ASSETS.md`. Layout is exact; only photographic
content is standing in.

## Not carried over

- The eight `bg-<scent>.png` assets are referenced by no artboard (the slides use
  `bottle-*`). Not extracted. Confirm whether they were intended as slide
  backgrounds.
- `assets/ios-frame.jsx` — referenced by no artboard.
- `uploads/` and `screenshots/` — working files from the design session.
