# Revamp plan — Claude Design project `0c4ed435`, second import

Branch: `feat/design-revamp`

The site on `main` was ported from this project on **2026-08-20**. The project has
since been redesigned end to end. This document is the implementation contract
for re-porting it: what changes, what does not, what enforces the difference.

> **Status: phases A–G executed.** What actually shipped is recorded in
> `docs/DESIGN-PARITY.md` (every deviation, with measured contrast) and
> `docs/ARCHITECTURE.md` (the layers as built). Three things were settled
> differently from the plan below, each for a reason found during the port:
>
> - `rgba(27,22,17)` **is** `#1b1611`, so there is no separate warm veil token —
>   four dark tokens, not five.
> - The ink and cream alpha scales were not extended; they were **deleted**.
>   Tailwind's `/N` modifier emits the artboards' own `color-mix` value, so no
>   alpha needs a token. The `--space-*` scale went the same way.
> - `tailwind-merge` had to be taught the custom font-size scale. Without it,
>   every button variant silently lost its label colour. See
>   `docs/ARCHITECTURE.md`.

**Source of truth.** `~/Desktop/Business Docs/Heirloom Scents/Heirloom Scents website redesign/`
— six artboards, the `classical` design system, and the full asset set. Read
2026-09-14. Every value in this document was read out of those files; nothing is
inferred.

---

## 0. The scope rule

> **No change lands that does not trace to an artboard line or to a gate named in
> this document.**

Concretely:

- No refactor of code the redesign does not touch. No dependency added that no
  artboard behaviour requires. No renaming for taste. No "while I'm here".
- Every commit names its phase (§7). A change that fits no phase does not belong
  in this branch.
- Deletions are the exception that **is** required: §6 is a closed ledger of what
  the redesign strands, and stranded code must go in the phase that strands it —
  not left for later.

The three existing audit scripts plus `knip` mechanically enforce most of this.
`npm run verify` is the gate.

---

## 1. What is confirmed unchanged

**Design system.** All six artboards link
`_ds/classical-d888ab7f-0538-4549-8b79-66d11f5325d8/styles.css`. `modernist` and
`nocturne` ship in the project but **no artboard references either** — they are
unused alternates and are not ported. The `classical` stylesheet is
value-for-value what `src/styles/globals.css` already holds: the same role
colours, all 27 ramp steps, the 1.15× spacing scale, the three radii, the three
shadows. **The token ramp does not move.**

**Tech stack.** Next 16.3.1 / React 19.2.8 / TypeScript 6 / Tailwind v4,
`motion`, `react-hook-form` + `zod`, `@daypicker/react`. No additions — §5
shows the new interactive work needs no new library.

**Architecture.** Layer boundaries, one-file-or-one-folder, `src/content/` as the
only home for copy and image keys, the booking store/notifier seams, `src/proxy.ts`.
All hold. This is a redesign, not a rewrite.

**Motion.** `assets/hs-motion.js` is unchanged from the first import: threshold 0,
`rootMargin 0px 0px -8% 0px`, `translateY(26px)`, 0.95s on
`cubic-bezier(0.22,0.61,0.36,1)`, and the rule that an element already above
`innerHeight * 0.92` is never hidden. `components/motion/reveal.tsx` already
implements exactly this and stays.

---

## 2. The token layer — one file, no duplicates

`src/styles/globals.css` stays the **single** declaration site. Tokens live only
in Tailwind v4 `@theme`, which emits the custom property _and_ the utility, so a
value is written once. Only `--nav-h` / `--nav-h-mobile`, which must not generate
utilities, sit in `:root`. `scripts/audit-tokens.mjs` fails the build on a raw
hex or `rgba()` anywhere else in `src/`.

### The one structural colour change: burgundy → night

The redesign **retires burgundy entirely**. Verified: `#400d15`, `#3a0a11`,
`#551620` and `#28070c` appear **zero times** across all six artboards. Every
dark ground is now `#1b1611`, with four overlay bases.

| Remove                                                         | Add                                                                                                                                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-burgundy`, `-deep`, `-lift`, `-dark`                  | `--color-night: #1b1611` (20 uses)                                                                                                                                            |
| `--color-error` (the artboard's booking error is `accent-800`) | overlay bases `--color-veil: 22 18 14` (10), `--color-veil-warm: 27 22 17` (6), `--color-veil-deep: 18 14 11` (1, lightbox), `--color-veil-lift: 74 60 42` (1, booking aside) |

`BRAND_HEX.burgundy` in `src/styles/brand-constants.ts` goes with it; `night`
replaces it. That file stays the only JS-side mirror, because `themeColor` and
OG rendering cannot read a custom property.

### Alpha scales — measured, not guessed

The artboards spend alpha inline. Counted across all six:

- **cream `#f1e8da`** at 14, 18, 55, 60, 62, 72, 82, 85, 86, 88, 90 % — 11 steps
- **ink (`--color-text`)** at 26, 30, 45, 48, 52, 55, 62, 64, 66, 70, 74, 76, 78 % — 13 steps
- **accent** at 12, 16, 18 % — the three hover tints

The existing `--color-cream-*` and `--color-ink-*` scales cover part of this.
Extend them to the measured set and delete steps no artboard uses. Do **not**
add a step "for symmetry" — the audit counts, and an unused token is a dead
token.

### Per-scent overlay bases

Each Notes slide paints a 90° gradient over its bottle photograph at
`0.86 → 0.62 → 0.10 → 0.22` opacity, from a per-scent rgb base:

| Scent              | Base rgb   |
| ------------------ | ---------- |
| Saffron Amber      | 25, 10, 6  |
| Golden Vanilla     | 30, 18, 8  |
| Midnight Vanilla   | 21, 18, 15 |
| Velvet Coffee      | 22, 12, 6  |
| Citrus Rose        | 24, 19, 15 |
| Ivory Petals       | 28, 22, 12 |
| Berry Cloud        | 24, 8, 14  |
| Velvet Lychee Rose | 24, 19, 15 |

Seven distinct bases for eight scents — Citrus Rose and Velvet Lychee Rose share
one. These stay per-scent data in `src/content/scents.ts` (the `overlay` field
already exists), not tokens: they are content, and the stop pattern is the
shared part.

### Type

The artboards' sizes all land on the existing `--text-*` scale. Two new display
sizes appear and are added: the Notes hero `h1` at **96px** and the Experience
ghost numeral at **190px** (already present as the `ghost` NumberMark variant).
The mobile override is uniform across all six pages — `h1 → 42px`, `h2 → 30px`
at `max-width: 860px`.

---

## 3. Layout shell — new, and shared by all six pages

Three things are identical on every artboard and belong in `app/layout.tsx`:

**Announcement bar** (new). `#1b1611` ground, cream text, centred, `padding
10px 24px`, `10.5px` at `0.18em` uppercase: _"Now booking fall and winter 2026
dates · Dallas, Texas · Book Now"_ with `Book Now` in `--color-accent` linking
to `/booking`. Above the nav, not sticky.

**Nav** (restructured). `position: sticky; top: 0; z-index: 60`, `--color-bg`
ground, `1px` bottom divider, `padding 16px 32px`, and a **three-column grid
`1fr auto 1fr`** with `gap 18px`:

| Column | Content                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| left   | Home · Events · Experience · Scents · About — `10px`, `0.18em`, uppercase, `gap 13px` / `row-gap 6px`, wrapping                |
| centre | `hs-mark.png` at `34px` + "Heirloom Scents" wordmark, `15px` semibold `0.1em` uppercase, `gap 14px`, linking to `/`            |
| right  | "Book an Event" — `11px`, `0.22em`, `1px` accent border, `padding 10px 16px`, hover `accent/12`, `transition background 0.35s` |

The current page's nav item renders as a **`<span>`, not a link**, in
`--color-accent-700` with a `1px` accent bottom border and `padding-bottom 4px`.
On `/booking` the right-hand CTA is likewise a `span` with `padding 11px 20px`.

**Mobile, at `max-width: 860px`** — one rule set, shared by all six artboards:
gutters to `24px`; nav becomes `display: flex; flex-wrap: wrap; justify-content:
center` with inner `gap 14px`; every `.hs-cols` grid collapses to `1fr`;
`.hs-reels` goes to 2 columns; interlude sections to `320px`; `h1 42px` / `h2 30px`.

> **Deviation, recorded.** There is no drawer. The artboards wrap the nav onto a
> second centred row on small screens, and that is what ships — it is the
> design's own answer, and a hamburger would be invention. The existing
> `site-header.tsx` drawer is therefore deleted (§6).

**Footers are per-page and differ.** Four shapes, all confirmed:

| Page              | Footer                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Home              | Full three-column `1.3fr 1fr 1fr` — mark + blurb, Quick Links (6), Contact (3) — then a centred © bottom bar |
| About, Experience | Flex row: © left, links right (`Home / Booking` and `Home / Events / Booking`)                               |
| Events            | Flex row with the `30px` mark centred between © and links                                                    |
| Booking           | Flex row: © · `30px` mark · "Memory, bottled."                                                               |
| Notes             | Nested **inside** the closing slide, on the dark ground, cream links                                         |

That is four genuine variants of one component, which is what
`site-footer.tsx`'s variant prop already exists for.

---

## 4. Page specifications

Section order and every load-bearing value. All page gutters are `56px` desktop
unless noted; content max-width `1180px`.

### `/` — Home

1. **Hero slideshow**, `78vh` / `min-height 520px`, ground `#1b1611`. Two slides,
   each a **three-panel filmstrip** `1fr 1.25fr 1fr`: outer panels
   `brightness(0.5)`, centre `brightness(0.62)`, all `background-size: cover`.
   Slides cross-fade on `opacity` over `1.2s ease-brand`. A
   `linear-gradient(rgba(22,18,14,0.28), rgba(22,18,14,0.5))` sits over them.
   Centred text (`padding 0 90px`): kicker `11px`/`0.3em`; `h1` **72px** weight
   400, `line-height 1.02`, `0.06em`, uppercase, `max-width 900px`; sub `15px`/`1.75`,
   `max-width 520px`; then a **pill CTA** — `border-radius 999px`, cream ground,
   `#1b1611` text, `padding 18px 42px`, `11.5px`/`0.22em`, hover ground → accent.
   Prev/next are `52px` circles inset `32px` at `top 50%`; below sit
   `56px × 3px` bar indicators, `gap 10px`, `bottom 26px`, active `--color-accent`,
   idle `rgba(241,232,218,0.35)`.

   | Slide | Kicker              | Title                    | CTA → route                        | left / centre / right                             |
   | ----- | ------------------- | ------------------------ | ---------------------------------- | ------------------------------------------------- |
   | 1     | Luxury Perfume Bar  | Scents that speak to you | Book Your Event → `/booking`       | brand-tower / brand-cart / brand-glasses          |
   | 2     | Custom Party Favors | Gifts that wow           | See the Experience → `/experience` | brand-lamp-row / brand-bottles / brand-gold-stand |

   Timing: advance every **6500ms**; any manual interaction resets the interval to
   **9000ms**. A change fades the text out over `450ms`, swaps, fades in.
   On mobile the filmstrip collapses to the **centre panel only** (outer two
   `display: none`).

2. **Explore Our Scents** — `padding 100px 56px 90px`. Centred eyebrow "Explore
   Our" + `h2` 52px "Scents". A right-aligned pair of `44px` circle buttons, then
   a horizontal **scroll-snap rail** (`scroll-snap-type: x mandatory`, scrollbar
   hidden) of all eight scents: cards `flex: 0 0 262px`, `gap 20px`, each a
   `.plate` at `4/5` over the bottle photograph, name `20px` semibold, origin
   `9.5px`/`0.18em` accent-700. Whole card links to `/scents`. Buttons scroll by
   **±846px** — exactly three cards. Closes with a centred outlined
   "Explore All Scents".

3. **Popular combinations** — divider, then eyebrow "Tried & Treasured" + `h2`
   48px. Four cards, `2 × 2`, `gap 28px`, `padding 38px 36px`, `1px` divider
   border, hover → accent border + `shadow-sm` over `0.4s`. Each: name `27px`
   semibold with a tabular `No. N` in accent, the three scents at
   `10.5px`/`0.16em`, body `13.5px`/`1.7` at ink-66, and "Read these scents →".
   The four are **The First Dance**, **Velvet Hour**, **Garden Party**,
   **Something Kept**.

4. **Marquee** — divider top and bottom, `padding 18px 0`, translating `-50%`
   over **36s** linear infinite, two identical halves. Items: Book Your Event ·
   Custom Favors · Now Booking · Dallas, Texas.

5. **Video band** — `72vh` / `min 440px`. `reel-3.mp4` at **opacity 0.6**,
   `object-fit: cover`, autoplay/muted/loop/playsInline, under a
   `linear-gradient(rgba(22,18,14,0.35), rgba(22,18,14,0.75))`. Centred `h2` 52px
   "Scents for every guest.", sub `14.5px`, outlined cream CTA "See It In Motion"
   → `/events`.

6. **We are Heirloom** — `1.1fr 1fr`, `gap 72px`. Justified body at ink-78;
   "About Us →" underlined accent link; right a `.plate` at `4/5` over
   `brand-gold-stand.jpg`.

7. **Newsletter** (new) — divider top, `padding 80px 56px`, centred. `h2` 38px
   "Stay in the scent loop.", sub `13.5px`, then an email `input` (`flex: 1;
min-width 220px`) beside a `btn btn-primary` "Subscribe", `max-width 480px`,
   wrapping.

8. **Value props** — three columns, `gap 40px`, each a `1px` top divider with
   `padding-top 20px`, title `19px` semibold, body `12.5px`/`1.7` at ink-64.

9. **Testimonial** — `max-width 900px`, centred. `hs-mark` at `40px`, then a
   `44px 1fr 44px` grid: circle prev, the quote, circle next. Blockquote `34px`
   italic weight 400; attribution `10.5px`/`0.22em` at ink-55. Three quotes,
   `min-height 140px`, auto-advance **7000ms** → **9000ms** after interaction,
   `450ms` opacity swap.

### `/scents` — from `Notes.dc.html`

The artboard file was renamed; **the route does not change.** Its own nav labels
the page "Scents" and the `h1` reads "Our Scents". `/scents` stays, and no
redirect is needed.

`html` carries `scroll-snap-type: y mandatory` and `scroll-padding-top: 79px`.
Every slide is `height: calc(100vh - 79px)` with `scroll-snap-align: start` and
`scroll-snap-stop: always`.

1. **Hero** — `bg-scents-hero.png` `object-position: center 40%` under a
   **Ken Burns** `scale(1) → scale(1.08)` over `24s ease-in-out infinite alternate`,
   then `radial-gradient(ellipse 110% 90% at 50% 45%, rgba(27,22,17,0.28),
rgba(22,18,14,0.82) 85%)`. Contents stagger in on `hsFadeUp` at
   **0.1s / 0.26s / 0.4s / 0.56s / 0.8s**: `hs-mark` 64px at `opacity 0.95`;
   eyebrow "The Scent Library"; `h1` **96px**; blurb `15px`/`1.8` `max-width 440px`;
   and a scroll cue — `9px`/`0.3em` "Scroll to meet them" over a `1px × 42px`
   accent bar animating `hsCue` `2.6s cubic-bezier(0.45,0,0.55,1)` infinite.

> **Superseded, on the count only.** This section records the artboard, which
> drew exactly eight slides and copy that named the number. The scents are a
> showcase, not a closed catalogue, so the count is no longer fixed anywhere in
> code or copy: `SCENTS` sets the length, and the copy says "signature" instead
> of "eight". Step One's link now reads "Meet our signature scents" and home's
> CTA "Explore the Scent Library". Everything else below still holds.

2. **Eight scent slides**, `No. 01`–`No. 08` in the order Saffron Amber, Golden
   Vanilla, Midnight Vanilla, Velvet Coffee, Citrus Rose, Ivory Petals, Berry
   Cloud, Velvet Lychee Rose. Each: the bottle photograph full-bleed at
   `object-position: center 40%`, the per-scent 90° gradient (§2), then a
   `1.1fr 1fr` grid (`max-width 1280px`, `padding 0 72px`) whose left column
   holds `No. 0N` `17px` tabular accent, `h2` **72px** weight 400, origin
   `10.5px`/`0.24em` accent, description `15px`/`1.85` at cream-90 `max-width 480px`,
   and "Best paired with · X · Y" at `11px`/`0.14em` cream-62. The right column
   is empty — it is the breathing room the gradient fades into.
   Slide 1 keeps `id="golds"`, slide 5 keeps `id="florals"`.

3. **Index rail** — `position: fixed; right: 30px; top: 50%; z-index: 55`,
   `gap 13px`. Eight buttons, each a tabular `9px` number plus a `1px` bar:
   active `34px` in accent, idle `16px` in `rgba(241,232,218,0.4)`, both animating
   over `0.4s`. The rail fades in (`opacity 0.5s`) only while a scent slide owns
   the viewport midpoint, and is `pointer-events: none` otherwise. Clicking scrolls
   that slide to `top - 79px`.

4. **Library close** — `#1b1611`, `hs-mark` 44px, `h2` 46px "Reading is one
   thing. Smelling is another.", blurb `max-width 400px`, outlined CTA "Book an
   Event →", and the page footer nested inside this final snap slide.

### `/experience`

1. **Hero** — `photo-step2-blend.png` at **opacity 0.36**, `object-position:
center 35%`, gradient `rgba(27,22,17,0.55) → 0.9`, `padding 130px 56px 120px`,
   `max-width 840px` centred. Eyebrow, `h1` 64px "Your guests become the
   perfumer.", blurb `14.5px`/`1.85` `max-width 500px`.
2. **Three steps**, alternating image side (image left, right, left), each
   `1fr 1fr` / `gap 72px`. The image is a `.plate` at **`5/4`** wrapping an inner
   div that scales to **1.05 over 1.4s ease-brand on hover**. Behind each heading
   sits the ghost numeral — `190px`, `accent/16`, `top: -72px; left: -14px`,
   `pointer-events: none; user-select: none`. Step One carries "Meet the eight
   scents →" → `/scents`; Steps Two and Three carry no link.
3. **Photo interlude** — `400px` tall (`320px` mobile), `photo-bottle-hand.png`
   at `center 40%`, gradient `0.5 → 0.68`, `hs-mark` 36px, italic `40px`
   "Made by their hands. Worn for years." at `max-width 620px`.
4. **Every booking includes** — centred eyebrow, then **four** columns with
   `1px` top dividers.
5. **CTA band** — `#1b1611`, mark 40px, `h2` 40px, outlined "Book an Event →".

### `/events`

1. **Video hero** — `76vh` / `min 480px`, `reel-4.mp4` at **opacity 0.55**,
   gradient `rgba(22,18,14,0.4) → 0.78`. Eyebrow "Events", `h1` 64px "A luxury
   perfume bar for your event." `max-width 820px`, outlined CTA "Book Your Event".
2. **Celebrate with scent** — `1fr 1.1fr`, `gap 72px`; `.plate` `4/5` over
   `brand-cart.jpg`; eyebrow "Elegance", `h2` 48px, justified body at ink-76,
   outlined "Book Now".
3. **Event types** — divider, then `2 × 2`, `gap 56px 48px`. Each: a `.plate`
   `4/5` that **lifts** on hover (`scale 1.015` + `shadow-md` over `0.9s`), then a
   `1px` top divider row pairing `h2` 32px with "Book this →", then justified body
   `13.5px`/`1.8` at ink-70. **Weddings** (brand-cart), **Bridal Showers**
   (brand-tower), **Private Events** (brand-glasses), **Brand Experiences**
   (brand-lamp-row).
4. **Film library** (new) — divider, eyebrow "The Bar, In Motion" opposite the
   hint "Tap any film to watch with sound". Four tiles, `4 → 2` columns,
   `gap 20px`, each a `.plate` at **`9/16`** on `#1b1611` holding a silent
   autoplay loop of `reel-1..4`, `pointer-events: none` on the video itself, a
   `38px` play circle at `right 12px; bottom 12px`, and `shadow-md` on hover.
5. **Film lightbox** — `position: fixed; inset: 0; z-index: 200`, ground
   `rgba(18,14,11,0.93)`. A `9/16` player at `height: min(86vh, 780px)`,
   `max-width 80vw`, `object-fit: contain` on black, **with `controls` and sound**.
   `46px` prev/next circles flank it, wrapping modulo 4; a `40px` close circle sits
   at `top: -18px; right: -18px`. Closes on Escape, on the close button, and on a
   backdrop click (`e.target === e.currentTarget` only).
6. **CTA band** — `#1b1611`, the four type names as a centred dotted row, `h2`
   40px "Tell us about yours.", outlined "Book an Event →".
7. **Newsletter** — identical to Home's. One component, two call sites.

### `/booking`

A `minmax(360px, 42%) 1fr` split at `min-height: calc(100vh - 79px)`; `hs-cols`
stacks it on mobile.

**Aside** — `#1b1611`, `photo-artist-pour.png` at **opacity 0.30** under
`linear-gradient(160deg, rgba(74,60,42,0.55), rgba(27,22,17,0.95))`, justified
`space-between`. Top: `hs-mark` 56px, `h1` 52px "One conversation. / Then the
cart is yours." (an explicit line break), blurb `max-width 380px`. Bottom: three
numbered rows (`1 / 2 / 3` tabular accent `17px`) separated by cream-18 top
borders — _Invite sent instantly_, _We plan it on the call_, _Proposal within two
days_ — then "Prefer email? hello@heirloomscents.com".

**Form** — `padding 64px 72px 72px`, `max-width 680px`. Eyebrow "Booking", `h2`
44px "Reserve your consultation." Then: name + email in `1fr 1fr`; an occasion
`select` (**Wedding, Bridal Shower, Private Event, Brand Experience**); and a
`1.25fr 1fr` row holding the calendar and the slot column.

- **Calendar** — `1px` divider box, `padding 20px 22px`. `32px` circle month
  arrows flank an `18px` semibold month label; prev disabled at the current
  month, next disabled **three months out**. `SU…SA` headers at `9px`/`0.14em`
  ink-48. Day cells are `aspect-ratio: 1`, `12.5px` tabular, transparent border
  by default, hover border accent, selected `accent/16` ground + accent border,
  closed ink-26 and non-interactive. Caption: "Greyed days are fully booked or
  closed."
- **Slots** — a `Time · <date hint>` label, then four full-width buttons:
  **10:00 AM, 12:30 PM, 3:00 PM, 5:30 PM**. Unavailable slots render as
  `<label> — booked`. Before a date is chosen the hint reads "pick a day first"
  and all four are disabled.
- **Reserve** — `btn btn-primary`, `padding 16px 44px`, `12px`/`0.18em`, with the
  error message beside it in **`--color-accent-800`** (the artboard uses no red).
  Validation order is exact: missing name/email → _"Add your name and email
  first."_; missing date/slot → _"Pick a day and time."_ Footnote follows.

**Confirmation** — `max-width 680px`, centred. `hs-mark` 64px, `h1` 52px "Your
consultation is scheduled.", the greeting naming the guest. Then an invite card:
a `#1b1611` header pairing "Calendar invite sent" with ".ics attached", over
`96px 1fr` **What / When / Guests** rows on `1px` dividers. Closes with "Need a
different time?" and two actions — "Back to home" (underlined accent link) and
"Book another" (a button resetting to the form).

> **Deviation, kept from the first import.** The artboard's availability is a
> mock: `hash(iso) % 7 === 0` for closed days, `(hash + idx*3) % 5 === 0` for
> taken slots. Real trading rules stay in
> `src/features/booking/lib/availability.ts`. The artboard's _visible_ rules —
> closed Sunday and Monday, nothing today or earlier, three months of reach —
> match the implementation and are confirmed, not changed.

### `/about`

1. **Story** — `1fr 1.1fr`, `gap 80px`, `padding 96px 56px 100px`. Left a
   `.plate` `4/5` over `brand-bottles.jpg` that lifts on hover. Right:
   `hs-mark` at **`76 × 76`, `border-radius: 50%`, `object-fit: cover`,
   `shadow-sm`** — the only circular use of the mark; `h1` 64px "A Dallas house
   of memory."; two justified paragraphs at ink-78.
2. **Founder** (new) — divider, `1.1fr 1fr`, `gap 80px`. Eyebrow "The Founder",
   blockquote `32px` italic, attribution. Right: a `.plate` at **`1/1`** whose
   image slot is **empty in the artboard**.
3. **Contact** — `#1b1611`, three centred columns, `gap 48px`: _Find us / Dallas,
   Texas_, _Write to us / hello@heirloomscents.com_, _Follow along /
   @heirloomscents_, each with a `12.5px` cream-62 sub.

> **Content gaps, not build gaps** — §9. The founder photo does not exist in the
> project; the attribution reads _"Founder name & bio to come"_ and the contact
> sub reads _"Email & phone stubs, to confirm"_. These ship as the artboard has
> them or get real content first; they are not invented.

---

## 5. Components — reuse first

The Reuse Gate: nothing new is written until the `primitives/` barrel is checked
for a variant that already covers the case.

**Kept unchanged** — `Plate` (its `border-6 border-surface` / `outline-divider` /
`sepia(0.22) saturate(0.82) contrast(1.05)` is the `classical` `.plate` exactly,
and both hover modes are still used at the artboards' own durations), `Eyebrow`,
`ArrowLink`, `Rule`, `NumberMark` (including the `ghost` 190px variant),
`Field`/`Input`/`Select`, `Reveal`, `Marquee`, `KenBurns`, `ScrollCue`,
`Stagger`, `Section`, `use-active-index`, and the whole `features/booking/lib`.

**Extended, not rewritten**

| Component             | Change                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`              | Add a `pill` variant (cream ground, night text, `radius 999px`, `padding 18px 42px`, hover → accent) for the hero CTA, and a `nav` size for the header's `10px 16px`. The `accent` / `cream` / `muted` variants already match the outlined CTAs. |
| `DarkBand`            | Ground moves burgundy → `--color-night`. Same component, one token.                                                                                                                                                                              |
| `SiteFooter`          | Reduce to the four confirmed shapes (§3); the `on-dark` variant now serves Notes' nested footer.                                                                                                                                                 |
| `TestimonialCarousel` | Retune to three quotes, 7000/9000ms, `44px 1fr 44px`, `34px` italic.                                                                                                                                                                             |
| `CtaBand`             | Night ground; the mark replaces the emblem.                                                                                                                                                                                                      |
| `PhotoInterlude`      | Height `400px` / `320px` mobile; italic 40px line instead of an eyebrow + heading pair.                                                                                                                                                          |

**New, and why each is unavoidable**

| Component         | Where                  | Why it cannot be a variant                                                    |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `Mark`            | 17 call sites          | Replaces `Emblem`. One asset, seven heights, plus About's circular treatment. |
| `AnnouncementBar` | layout                 | New shell element.                                                            |
| `HeroSlideshow`   | Home                   | Filmstrip panels, cross-fade, dots, prev/next, dual-interval timing.          |
| `CardRail`        | Home scents            | Snap rail with ±846px paging buttons.                                         |
| `BackgroundVideo` | Home band, Events hero | Shared: `cover`, per-call opacity, gradient slot, reduced-motion poster.      |
| `FilmGrid`        | Events                 | The 9/16 silent-preview tiles.                                                |
| `FilmLightbox`    | Events                 | Modal player with sound, wrapping nav, Escape/backdrop close.                 |
| `NewsletterForm`  | Home + Events          | Two call sites, one component.                                                |

No new dependency. Slideshow, rail, lightbox and carousel are `useState` +
`useEffect` + `useRef`; `motion` already covers what animates.

**Client-boundary discipline.** Only the eight interactive pieces above plus the
booking form carry `"use client"`. Every page shell, section wrapper and static
band stays a server component.

> **Deviation, recorded.** The artboards poll every 900ms to force
> `video.muted = true` and re-`play()`. That is a design-canvas workaround for the
> preview iframe. `BackgroundVideo` sets `muted` on the element via ref before
> play — React's `muted` prop alone is unreliable — and does **not** ship a
> polling interval.

---

## 6. Cleanup ledger — closed, and done inside the phase that strands it

Nothing on this list is optional, and nothing is deferred past its phase.

**Assets the redesign strands.** Confirmed by grepping all six artboards: of 32
files in `assets/`, **27 are referenced**. These are not, and their repo copies go:

- `hs-emblem-burgundy.png`, `hs-emblem-cream.png`, `hs-emblem-gold.png` — the
  three real images from the first import, superseded by `hs-mark.png`
- `photo-cart-curtain.png`, `photo-cart-hero.png`, `photo-hero-bg.png`,
  `photo-setup-blue.png`, `photo-setup-sage.png`
- The eight `bg-<scent>.png`. The first import's open question — whether they
  were meant as slide grounds — is now **answered: no.** The slides use
  `bottle-*`. They remain referenced by no artboard and are not imported.
- `ios-frame.jsx`, `image-slot.js`, `support.js`, `screenshots/`, `uploads/` —
  canvas runtime and working files, as before.

**Code stranded by the above**

| Delete                                                  | Because                                                  |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `primitives/emblem.tsx`                                 | `Mark` replaces it; the three tone assets are gone       |
| The drawer in `layout/site-header.tsx`                  | The artboards wrap the nav instead (§3)                  |
| `BRAND_HEX.burgundy`                                    | Zero occurrences in the redesign                         |
| `--color-burgundy{,-deep,-lift,-dark}`, `--color-error` | Same                                                     |
| Unused `--color-cream-*` / `--color-ink-*` steps        | Against the measured set in §2                           |
| `scripts/generate-placeholders.mjs`                     | Every image is now real; the placeholder path is dead    |
| `design-reference/asset-report.json`                    | Describes the first import's truncated fetch; regenerate |

**Documentation.** `docs/DESIGN-PARITY.md` is rewritten from scratch — it
documents deviations from artboards that no longer exist. `docs/ASSETS.md` loses
the entire "why 20 are placeholders" narrative. `docs/ARCHITECTURE.md` gets the
new component rows. `design-reference/README.md` re-dates to this import and
records that the artboards are now on disk. `README.md` route table is checked.

**Comments.** Every code comment naming burgundy, the emblem tones, the
truncation cap, the placeholder pipeline, or a superseded artboard behaviour is
corrected or deleted in the phase that invalidates it. A comment describing
something that no longer exists is worse than no comment.

**The mechanical check.** `knip` must report zero unused files, exports and
dependencies, and `npm run audit:assets` zero orphans, before Phase F closes.

---

## 7. Phases, each with its own gate

Each phase ends green before the next begins. No phase reaches into another's
files.

| #     | Phase        | Work                                                                                                                      | Gate                                              |
| ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **A** | Tokens       | §2 in `globals.css` + `brand-constants.ts`. Nothing else.                                                                 | `audit:tokens`, `typecheck`, build                |
| **B** | Assets       | Import the 27 referenced files at source resolution; `images:manifest`; delete the strandees; regenerate the asset report | `audit:assets`, the manifest unit test            |
| **C** | Shell        | Announcement bar, three-column nav, four footers, layout metadata                                                         | `smoke` + `navigation` e2e across four viewports  |
| **D** | Primitives   | `Mark`; the `Button` variants; `DarkBand`/`CtaBand`/`PhotoInterlude` retunes; delete `Emblem`                             | `audit:reuse`, `knip`, unit tests                 |
| **E** | Pages        | Six pages in order Home → Scents → Experience → Events → Booking → About, each with its interactive components            | Per-page e2e + axe before moving on               |
| **F** | Cleanup      | Close §6 in full: docs rewritten, comments corrected, dead files gone                                                     | `knip` zero, `audit:assets` zero, `format:check`  |
| **G** | Verification | §8 in full                                                                                                                | `npm run verify` green, then the functional sweep |

---

## 8. Testing — including the button-by-button sweep

`npm run verify` already chains typecheck → lint → format → unit → `audit:tokens`
→ `audit:reuse` → `knip` → build → `audit:bundle`. That stays the spine. On top:

**Unit (Vitest).** Existing: availability rules, `.ics`, notifier bodies, content
integrity. Added: the slideshow's index-advance and wrap arithmetic; the
lightbox's modulo-4 prev/next; the rail's ±846px paging; `pad2`; the per-scent
overlay data shape; a manifest test asserting all 27 assets exist on disk with
non-zero dimensions.

**Functional / interaction sweep (Playwright).** This is the explicit
after-the-build pass, run at all four viewports — desktop 1440, laptop 1024,
tablet 768, mobile iPhone 13 / WebKit.

_Every button and link, enumerated from §4 and asserted to do what the artboard
says:_

- **Shell** — announcement "Book Now" → `/booking`. All five nav links reach
  their route. The current page's item is a `span`, not a link, on every page.
  Centre mark → `/`. "Book an Event" → `/booking`, and is a `span` on `/booking`.
  Every footer link, in all four footer shapes.
- **Home** — hero prev/next/dots change slide and reset the interval; both slide
  CTAs reach the right route; rail arrows scroll by three cards and the rail
  snaps; all eight scent cards → `/scents`; "Explore All Scents" → `/scents`;
  four "Read these scents →" → `/scents`; "See It In Motion" → `/events`;
  "About Us →" → `/about`; testimonial prev/next advance and wrap; newsletter
  validates an empty and a malformed address.
- **Scents** — all eight rail buttons scroll their slide to the top; the rail is
  hidden at the hero and visible on slides; snap-stop holds one slide per gesture;
  `#golds` and `#florals` still land; the closing CTA → `/booking`.
- **Experience** — "Meet the eight scents →" → `/scents`; the CTA → `/booking`;
  the three plates scale on hover.
- **Events** — hero CTA and "Book Now" → `/booking`; four "Book this →" →
  `/booking`; each of the four tiles opens the lightbox on the right film;
  prev/next wrap both directions; Escape closes; a backdrop click closes; a click
  _inside_ the player does not; the lightbox player has controls and the tiles are
  silent.
- **Booking** — the full happy path; both validation messages in order; month
  arrows disable at bound zero and three; closed days are unclickable; slots
  disable before a date is chosen; a booked slot reads "— booked"; "Book another"
  returns to a clean form; "Back to home" → `/`.
- **About** — both footer links; the two plates lift on hover.

**Accessibility (axe, WCAG 2.2 AA, zero violations, under
`prefers-reduced-motion`).** All six routes, plus heading order, plus:

- Contrast is **re-derived, not inherited**. The first import's substitutions were
  measured against burgundy; the ground is now `#1b1611`, so every cream-on-night
  and accent-on-night pair is re-measured. The `accent-700`-for-label-text rule
  from the `classical` readme still governs the light ground.
- The lightbox gets what the artboard omits: `role="dialog"`, `aria-modal`, a
  focus trap, focus restored to the invoking tile on close, and an accessible
  name. Recorded as a deviation.
- Videos are decorative: `aria-hidden`, no captions required for silent loops.
  The lightbox player, which has sound, is user-invoked.
- Reduced motion: the slideshow stops auto-advancing, Ken Burns and the marquee
  freeze, background videos show a poster frame.

**Performance.** `audit:bundle` holds the budget. Separately: the referenced
assets total ~35MB raw — `bg-scents-hero.png` alone is 2.2MB, the eight bottles
~1MB each, and the four reels 17MB. Images go through `next/image`; the reels
need compression and poster frames, and the four Events tiles must lazy-load
rather than fetch 17MB on paint.

**Design adherence.** `_ds/classical-*/_adherence.oxlintrc.json` encodes the
system's own rules — no raw hex, no raw px, only Cormorant Garamond and Lora. Its
intent is already covered by `audit-tokens.mjs`; Phase F confirms the two agree
rather than adding a second linter.

---

## 9. Content decisions

Everything needed to build was confirmed from the artboards. These six items
were content, not construction. Four are now settled.

### Settled

1. **`reel-4.mp4` shows two identifiable guests.** Cleared — the same reel is
   already public on the studio's Instagram, so the `/events` hero keeps it.
2. **Contact details.** There is **no** `hello@heirloomscents.com` and no phone
   number. The address the artboards showed — under their own note reading
   "Email & phone stubs, to confirm" — does not exist, so it is displayed
   nowhere: not in the footer, not on `/about`, not in the booking aside, and
   not in the `LocalBusiness` structured data. Instagram and the booking form
   are the two routes that work, and the artboard's third contact column now
   carries the booking form instead of a dead mailbox.
   `tests/e2e/interactions.spec.ts` fails on any `mailto:` link or any
   `@heirloomscents.com` address appearing on any route, so it cannot creep
   back.
3. **Founder photo, name and bio.** Deferred by the business. The block ships
   as the artboard draws it: a labelled empty mat reading "Founder portrait to
   come", and the attribution the artboard itself carries. Replacing both is a
   one-file edit in `src/content/pages.ts` plus one asset.
4. **Announcement copy.** Lives in `src/content/site.ts` as
   `announcement.notice`, so the seasonal line has one home. It still needs an
   owner who updates it — it is the one string on the site that goes stale on a
   calendar.

### Still open

5. **Newsletter.** The artboard has an input and a Subscribe button and no
   backend. Today the form validates the address and then says plainly that the
   list is not open yet — it never accepts and discards one. To finish it:
   wire a provider, post to the existing notifier seam, or drop the band.
6. **The booking confirmation overstates what happens.** The screen says "Two
   calendar invites have just been sent". Nothing is sent: `getNotifier()`
   returns `ConsoleNotifier` until `RESEND_API_KEY` is set, so the invite is
   logged to the server and the guest receives nothing. The form, the trading
   rules, the validation and the `.ics` generation are all real — only delivery
   is missing. Either wire Resend before launch (see `docs/DEPLOYMENT.md`) or
   soften the copy to what actually occurs. This is a promise made to a
   customer, so it is the business's call rather than a code cleanup.
