# Design parity

Every intentional deviation from the Claude Design artboards, with its reason.
Nothing here is an oversight — do not "fix" these back.

Source: project `0c4ed435`, `classical` design system
(`_ds/classical-d888ab7f`), read 2026-09-14. `modernist` and `nocturne` ship in
the project but no artboard references either; they are not ported.

Desktop at 1440px is pixel-faithful. Everything below the design's own
`861px` line is derived from the design language, because the artboards are
authored desktop-only.

---

## Accessibility

The artboards' colour choices were re-measured against the redesign's own
ground, not inherited from the first port. `#1b1611` is a different ground from
the burgundy it replaced, so every pair was recomputed.

### Substitutions on the light ground (`#f3f2f2`)

| Artboard                                     | Implementation       | Measured                                        |
| -------------------------------------------- | -------------------- | ----------------------------------------------- |
| Eyebrows and label text in `--color-accent`  | `--color-accent-700` | 3.02:1 → **5.97:1**                             |
| `.btn-primary`'s label in `--color-accent`   | `--color-accent-700` | 3.02:1 → **5.97:1**                             |
| Link hover in `--color-accent-600`           | `--color-accent-800` | 3.92:1 → **9.10:1**                             |
| Muted text at 62%, 55%, 52%, 48% and 45% ink | **65% ink**          | 4.48 / 3.63 / 3.33 / 2.98 / 2.74:1 → **4.92:1** |

65% is the single muted step, chosen because 63% is the first passing value and
65% still clears 4.5:1 over the confirmation card's `surface/60` ground
(**4.82:1**). The `classical` readme prescribes this substitution directly: _"for
paragraph-size text in the accent use a deep ramp step (`--color-accent-700` on
this ground) rather than the accent itself."_

Link hover is the one case where the design's direction had to invert. The
artboards brighten a link on hover, and on a light ground brighter always means
less contrast — there is no compliant lighter step. Hover therefore deepens
instead.

### Verified as drawn

Everything on the night ground passes unchanged and is kept: cream at 100–55%
measures 14.79:1 down to 5.23:1, and the bright accent on night measures
**5.33:1** — so the accent is kept there, exactly as the artboards set it. On the
light ground the artboard's paragraph alphas (78%, 76%, 74%, 70%, 66%, 64%) all
pass, from 7.50:1 down to 4.76:1, and are untouched. The booking error's
`accent-800` measures 9.10:1 and is kept.

`ink/30` on disabled slot buttons and `ink/26` on closed calendar days are kept
as drawn: WCAG 1.4.3 exempts inactive controls, the state is also carried by the
`disabled` attribute, and greying is the convention the design is using.

### Structure the artboards could not express

| Artboard                                                                  | Implementation                                                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| The film lightbox is a plain `<div>`                                      | `role="dialog"`, `aria-modal`, an accessible name, a Tab trap, and focus returned to the tile that opened it                  |
| Hand-rolled calendar button grid, no ARIA grid and no keyboard navigation | `@daypicker/react`, styled to match exactly                                                                                   |
| Hero dot indicators all labelled "Go to slide"                            | Numbered — "Go to slide 1", "Go to slide 2" — plus `aria-current`                                                             |
| One error message beside Reserve                                          | Per-field errors wired through `aria-describedby`, plus the artboard's own combined date-and-slide message                    |
| No skip link                                                              | Skip link to `#main`                                                                                                          |
| Two visible marquee tracks, both readable by a screen reader              | The content once in `sr-only`; both visual tracks `aria-hidden`                                                               |
| Background videos are plain `<video>`                                     | `aria-hidden`, `tabIndex={-1}` — decorative. The lightbox player is user-invoked and keeps its controls                       |
| Scent index rail idle steps at `cream/50` and `cream/40`                  | `cream/70` and `cream/60`. The rail sits at the right edge where the slide gradient is thinnest (0.22), over bare photography |

All six routes pass axe at WCAG 2.2 AA with zero violations, measured under
`prefers-reduced-motion` so axe sees settled state rather than mid-transition
opacity.

---

## Responsive

The artboards carry exactly one media query — `max-width: 860px` — with the same
rule set on all six. The token layer therefore clears Tailwind's five default
breakpoints and defines one: `desk` at `861px`. The codebase cannot grow a
breakpoint the design never drew.

Ported as drawn: gutters 56px → 24px, every `.hs-cols` grid to one column, the
film grid 4 → 2 columns, the photo interlude 400px → 320px, `h1` → 42px and
`h2` → 30px, the hero filmstrip down to its centre panel alone.

Four deviations, all on the scent deck, where the artboard's fixed geometry
breaks on a phone:

| Artboard                                                     | Implementation                            | Why                                                                                                                               |
| ------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `scroll-snap-type: y mandatory` on `<html>` at every width   | From `desk` up only                       | A mandatory snap on a phone strands any slide taller than the viewport — there is no way to scroll within a snapped slide         |
| Slides fixed at `calc(100vh - 79px)` with `overflow: hidden` | `min-height` below `desk`, growing to fit | At 390px the description is simply clipped                                                                                        |
| Slide copy padded `0 72px` on an inner div                   | 24px below `desk`                         | The artboard's own `24px !important` targets `section`; the padding is on a child, so mobile gets 96px a side and a 198px measure |
| The index rail fixed at `right: 30px` at every width         | Hidden below `desk`                       | It lands on top of the slide copy                                                                                                 |

**No mobile drawer.** The artboards wrap the whole nav bar into centred rows
below 861px, and that is what ships. A hamburger would be invention, so the
first port's drawer is deleted.

---

## Behaviour

| Artboard                                                                                    | Implementation                                                                                                | Why                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Availability from `hash(iso) % 7` and `(hash + i*3) % 5`                                    | Real trading rules in `features/booking/lib/availability.ts`                                                  | The hash was a mock. The artboard's _visible_ rules — closed Sunday and Monday, nothing today or earlier, three months of reach — match the implementation and are unchanged |
| "Calendar invite sent" is a static screen                                                   | Real validation, `.ics` generation, and a persistence seam                                                    | Sending is pending Supabase and Resend — see `docs/DEPLOYMENT.md`                                                                                                            |
| A 900ms interval re-mutes and re-plays every background video                               | `muted` set on the node, playback started from an effect, paused off-screen, poster kept under reduced motion | The interval is a workaround for the design canvas's preview frame, not a production requirement. Four reels on /events must not all decode at once                          |
| Rail position from a scroll listener calling `getBoundingClientRect()` on 8 nodes per frame | `IntersectionObserver`                                                                                        | Identical behaviour, off the main thread                                                                                                                                     |
| Dark-ground hover tints at 16% and 18%                                                      | 16%                                                                                                           | A 2% alpha difference on a hover state is imperceptible; two variants are not worth the surface                                                                              |
| `<image-slot>` drag-drop placeholders                                                       | `next/image`                                                                                                  | The slot is a design-canvas scaffold, not a production component                                                                                                             |
| An email field and a Subscribe button with no destination                                   | Validates, then states the list is not open yet                                                               | There is no subscription backend. Accepting an address and discarding it silently is not an option — see `docs/REVAMP-PLAN.md` §9                                            |
| An empty image slot in About's founder block                                                | A labelled empty mat                                                                                          | No founder portrait exists in the design project. Borrowing an unrelated photograph would misrepresent a person                                                              |
| `scroll-snap-type` set on `<html>` by the page                                              | A class toggled on `<html>` for the lifetime of `/scents`                                                     | A route cannot style the html element in the App Router — it belongs to the root layout                                                                                      |

Reduced motion is honoured beyond what the artboards specify: the hero
slideshow and the testimonial pager stop auto-advancing, Ken Burns and the
marquee freeze, background videos hold their poster frame, and the scent deck's
snap is released.

---

## Type and colour

The artboards set **34 distinct font sizes** and **11 tracking steps** inline,
and spend 13 ink alphas, 11 cream and 3 accent as ad-hoc `color-mix()`
percentages. These collapse into `globals.css`:

- Sizes and tracking become the named `--text-*` and `--tracking-*` scales. Every
  step is one the artboards actually set; rendered sizes are unchanged. The
  `classical` readme is explicit that this is "a fixed scale".
- **No alpha tokens at all.** Tailwind's `/N` modifier compiles `text-ink/66` to
  `color-mix(in srgb, #201f1d 66%, transparent)` — identical to the artboards'
  own inline value, because mixing with `transparent` premultiplies and the srgb
  and oklab paths agree. Verified against a real Tailwind compile.
- **No spacing scale.** The artboards set spacing in raw pixels and reference
  `--space-*` nowhere, so Tailwind's default 4px scale applies and lands on the
  design's rhythm exactly: `p-14` is 56px, `gap-18` is 72px, `pt-25` is 100px.

Two additions to the element layer, both the design system's own and both missed
by the first port:

- `letter-spacing: -0.015em` on `h1`–`h6`. The system sets it and the artboards'
  headings inherit it without restating it.
- `font-weight: 600` as the heading default, with display headings opting down to
  the normal cut per instance, exactly as the artboards do.

`text-wrap: balance` on headings is **not** from the design system. It is kept
from the first port: it changes only where a heading breaks inside the design's
own `max-width`, and it earns its place at the widths the artboards never drew.

`scripts/audit-tokens.mjs` fails the build if a raw hex or `rgba()` appears
outside the token layer. The per-scent gradient bases are the one exemption —
they are content, and live in `src/content/scents.ts`.

---

## Not carried over

Of the 32 files in the project's `assets/`, **27 are referenced** by an artboard
and are imported. These five groups are not:

- The eight `bg-<scent>.png`. The first import left open whether they were meant
  as slide grounds; the redesign **answers it — no.** The slides use `bottle-*`,
  and no artboard references a `bg-<scent>` file.
- `hs-emblem-burgundy.png`, `hs-emblem-cream.png`, `hs-emblem-gold.png` — the
  three real images from the first import, superseded by `hs-mark.png`, which
  the redesign uses 17 times.
- `hs-monogram-tan.png` — the social avatar, referenced by no artboard.
- `photo-cart-curtain`, `photo-cart-hero`, `photo-hero-bg`, `photo-setup-blue`,
  `photo-setup-sage` — stranded by the redesign's new section set.
- `ios-frame.jsx`, `image-slot.js`, `support.js`, `screenshots/`, `uploads/` —
  canvas runtime and working files from the design session.

`npm run audit:assets` fails the build in both directions: a file on disk that
nothing references, and a manifest entry with no file.
