# Revamp plan — Claude Design project `0c4ed435`, second import

Branch: `feat/design-revamp`

The site on `main` was built from this same Claude Design project, imported
**2026-08-20** (see `design-reference/README.md`). The project has since been
redesigned end to end. This document is the plan to re-port it.

> **Status: blocked on design access.** The artboards cannot be read from this
> session — `DesignSync` reports that design-system authorization is missing and
> `/design-login` cannot run in a non-interactive session. Section 1 records what
> is confirmed from the local working tree and the source assets on disk.
> Sections 3–5 are the plan. Section 6 lists every value that must come **out of
> the artboards** rather than be guessed, per the standing instruction that
> nothing in this revamp is assumed.

---

## 1. Confirmed — current state on `main`

Six routes, all server-rendered, no client-side router state:

| Route         | Entry                         | Composed from                                                 |
| ------------- | ----------------------------- | ------------------------------------------------------------- |
| `/`           | `src/app/page.tsx`            | `sections/home/{hero,memory,experience,combinations,gallery}` |
| `/about`      | `src/app/about/page.tsx`      | `Section` + `Plate` + `DarkBand` + `SiteFooterSplit`          |
| `/scents`     | `src/app/scents/page.tsx`     | `ScentRail` + 8 × `ScentSlide` in an `lg`-only snap container |
| `/experience` | `src/app/experience/page.tsx` | `DarkBand` hero + `StepRow` + `INCLUDED` grid + `CtaBand`     |
| `/events`     | `src/app/events/page.tsx`     | centred header + `EVENT_TYPES` grid + `CtaBand`               |
| `/booking`    | `src/app/booking/page.tsx`    | `sections/booking.tsx` → `features/booking/*`                 |

Layer boundaries, the three enforcement scripts (`audit-tokens`, `audit-reuse`,
`knip`), and the test matrix are documented in `docs/ARCHITECTURE.md` and hold.
`npm run verify` is the gate.

**Token layer.** `src/styles/globals.css` is a verbatim port of the `classical`
design system — 27 ramp steps, 27 type sizes, tracking scale, spacing at 1.15×
density, radii, shadows, two easing curves — plus a brand layer the artboards
used raw (burgundy `#400d15`, cream `#f1e8da`, `--nav-h: 79px`). Everything sits
in Tailwind v4 `@theme`; `audit-tokens.mjs` fails the build on a raw hex outside
it.

**Imagery.** 23 manifest entries, of which **20 are dimension-accurate
placeholders** — the design MCP's `get_file` truncates at 256 KiB and every
source photograph exceeds it. Only the three emblems came through intact.

---

## 2. Confirmed — what the revamp adds

Diffing the project's current file list against the 2026-08-20 asset report:

| New in the project                                                      | Was it in the first import?                              |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `_ds/modernist-…`, `_ds/nocturne-…`                                     | **No** — the project carried only `classical`            |
| `Notes.dc.html`                                                         | **No** — the eight-scent artboard was the `/scents` deck |
| 8 × `bg-<scent>.png`                                                    | Present but _referenced by no artboard_; not extracted   |
| 6 × `brand-*.jpg` (bottles, cart, glasses, gold-stand, lamp-row, tower) | **No** — first real photography                          |
| 4 × `reel-*.mp4`                                                        | **No** — the site has no video today                     |
| `hs-mark.png`, `hs-monogram-tan.png`                                    | **No** — only the three `hs-emblem-*` marks              |

Three of these are structural, not cosmetic:

1. **Three design systems where there was one.** Whichever the revamped
   artboards actually link decides whether `globals.css` is amended or replaced.
   `nocturne` in particular reads as a dark scheme, which would invert the whole
   ground/ink relationship rather than tweak it.
2. **`Notes.dc.html`.** If the scent deck is now "Notes", `/scents` is renamed —
   which means a route move, nav and footer label changes, sitemap changes, the
   home page's combination-card deep links (`#golds` and siblings) re-pointed,
   and a permanent redirect so existing links survive.
3. **Video.** The site has no video primitive. Reels need an autoplay/muted/loop
   background treatment with a `prefers-reduced-motion` still fallback, a poster
   frame, and `playsInline` — plus a decision about audio, since all four reels
   carry an AAC track.

---

## 3. Source assets on disk

`~/Desktop/Business Docs/Heirloom Scents/` — the real photography and video.

### Photographs (6, all portrait)

| File            | Pixels      | Content                                                                                                            | Proposed design name   |
| --------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `DD47C2F2-…JPG` | 1065 × 1477 | The branded cart, full: wordmark front panel, dispenser tower, florals, QR frame, lamp, gold stand, burgundy drape | `brand-cart.jpg`       |
| `4E085991-…JPG` | 1320 × 1760 | The dispenser tower head-on — eight labelled vessels on the rack, tasting glasses below, tester row                | `brand-tower.jpg`      |
| `4F27CD4E-…JPG` | 1080 × 1440 | Tasting glasses with stirrers along the shelf edge, tester bottles beneath                                         | `brand-glasses.jpg`    |
| `B2D3C449-…JPG` | 1080 × 1440 | A heap of finished bottles, gold caps, burgundy labels, on cream cloth                                             | `brand-bottles.jpg`    |
| `BFBCB090-…JPG` | 1080 × 1440 | Four bottles in a row beside the fluted gold lamp                                                                  | `brand-lamp-row.jpg`   |
| `65A526FB-…JPG` | 1086 × 1448 | Two-tier scalloped gold stand, single bottle, red drape                                                            | `brand-gold-stand.jpg` |

The mapping is inferred from content against the design's descriptive filenames —
each photograph has one unmistakable subject and each name is claimed once. It
is the one inference in this document, and it verifies in seconds against the
artboards once they are readable.

### Reels (4)

All **576 × 1024** (9:16), H.264, 30 fps, AAC audio present.

| File                        | Duration | Content                                                           |
| --------------------------- | -------- | ----------------------------------------------------------------- |
| `…dai0u87og65ihgjdiui0.mp4` | 47.1 s   | The cart in a white-draped ballroom with florals — signature shot |
| `…d869t4nog65ne40t6fr0.mp4` | 32.0 s   | Two guests holding branded gift bags                              |
| `…d7n25m7og65sn830esng.mp4` | 20.4 s   | Sorority formal setup, painted banner backdrop                    |
| `…da8t227og65jli3bcik0.mp4` | 18.9 s   | Burgundy curtain entrance, monogram on a lit wall — cinematic     |

`compressed/` holds these; the `.MOV` originals are smaller on disk and are
HEVC — the `.mp4` set is the web-ready one.

Two things to settle before any of this ships:

- **Reel numbering.** Which file is `reel-1` … `reel-4` comes from the
  artboards, not from the folder order above.
- **The guest reel shows identifiable faces.** Publishing it on a public
  marketing site needs the subjects' consent on record. Flagging it rather than
  deciding it.

### Not source assets

`Screenshot 2026-09-12 at 3.27.25 PM.png` and `…3.56.12 PM.png` (1260 × 2736)
are social-profile screenshots — the tan monogram avatar, matching
`uploads/hs-monogram-tan.png`. They are reference, not layout specs. The
project's `uploads/` and `screenshots/` are design-session working files and
stay out of the repo, as they did in the first import.

---

## 4. How the port runs

Once the artboards are readable, per page, in this order:

**Phase A — foundations, before any page work.** Read all three `_ds/*/readme.md`

- `styles.css` + `_ds_manifest.json`; determine which system the revamped
  artboards link; diff it against `globals.css`. Read `assets/hs-motion.js` for the
  revamped reveal/scroll behaviour. Read `_adherence.oxlintrc.json` — it encodes
  the system's own lint rules and is the cheapest check that the port obeys them.
  Settle the route map (`Notes` question) before touching `src/app/`.

**Phase B — primitives and patterns.** Extract the button, eyebrow, plate,
emblem, rule, field, arrow-link and number-mark specs from the revamped
artboards. Each gets confirmed against all four states — rest, hover, focus,
active/disabled — rather than rest alone, since hover tints and focus rings are
where the first import had to deviate. Add the video primitive here, not inline
in a page.

**Phase C — pages,** each end to end: section order, every spacing value, every
image placement with its `object-position`, opacity and any Ken-Burns scale,
every button with its destination and variant, every anchor, and the breakpoint
behaviour at 1440 / 1024 / 768 / 390.

**Phase D — assets.** Ingest the six photographs and four reels at source
resolution, regenerate the manifest (`npm run images:manifest`), retire the 20
placeholders that the revamp still references, delete the ones it no longer does.

**Phase E — verification.** `npm run verify`, then Playwright across the four
viewports and axe at WCAG 2.2 AA on every route, then rewrite
`docs/DESIGN-PARITY.md` from scratch — the current one documents deviations from
artboards that no longer exist.

Accessibility deviations are re-derived, not inherited. The first import had to
darken the accent, the muted inks and the cream-on-burgundy to clear 4.5:1; if
the revamp ships a different palette those exact numbers do not carry over, and
if it ships `nocturne` the contrast maths is entirely different.

---

## 5. What stays

Tech stack is unchanged: Next 16.3.1 / React 19.2.8 / TypeScript 6 / Tailwind v4,
`motion` for animation, `react-hook-form` + `zod` for the booking form,
`@daypicker/react` for the calendar.

The architecture holds too — the layer boundaries, one-file-or-one-folder, the
content layer as the only home for strings and image keys, the booking store and
notifier seams, and the three audit scripts. This is a redesign, not a rewrite;
what changes is everything visual, not the shape of the codebase.

---

## 6. Open — must come from the artboards

Nothing below is assumed. Each needs the design project open.

**Foundations**

1. Which design system the revamped artboards link — `classical`, `modernist` or `nocturne`.
2. Whether the palette, type scale, spacing density, radii and shadows change, and by how much.
3. Nav height, and whether the nav is still 79 px / 65 px mobile.
4. The revamped `hs-motion.js` behaviour — reveal thresholds, stagger, Ken-Burns duration and scale.

**Routing and navigation**

5. The route map: does `Notes.dc.html` replace the scent deck, sit alongside it, or mean something else?
6. Nav item order and labels; whether "Book an Event" stays the standalone CTA.
7. Mobile nav: drawer, full-screen overlay, or something new — and its open/close transition.
8. Footer: how many variants, and which route carries which.

**Per page (× 6)**

9. Section order and full vertical rhythm.
10. Every image: which asset, at what crop, `object-position`, opacity, scale-on-scroll, hover behaviour.
11. Every button and link: label, variant, destination, and its four states.
12. Card behaviour — lift, tint, image scale, border, shadow, and the easing and duration of each.
13. Breakpoint behaviour at 1024 / 768 / 390, since the artboards are authored desktop-only.

**Video**

14. Which reel plays where, at what numbering, and whether muted-autoplay-loop, scroll-triggered, or click-to-play.
15. Poster frames, and the `prefers-reduced-motion` fallback.

**Scents / Notes deck**

16. Whether the 8 `bg-<scent>.png` are now the slide grounds, and how they compose with `bottle-*`.
17. Whether the mandatory scroll-snap deck survives the revamp.

---

## Unblocking

One of:

- `/design-login` in an interactive Claude Code session on this machine — this
  session then reuses that authorization and the import runs unattended; or
- the project files placed in the working tree (a `design-source/` directory, as
  the sibling `chaska` project does) — the six `.dc.html` artboards plus the
  three `_ds/` bundles are what matter; or
- "Send to Claude Code Web" from Claude Design, which seeds the project into the
  workspace directly.
