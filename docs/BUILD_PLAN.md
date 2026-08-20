# Heirloom Scents — Build Plan

**Source design:** Claude Design project `0c4ed435-1fea-4231-b2f2-a1c0a0df68bf` — "Heirloom Scents website redesign"
**Design system in use:** `classical` (`_ds/classical-d888ab7f-0538-4549-8b79-66d11f5325d8`)
**Status:** Delivered. This is the original plan, kept as the record of decisions and gates.
For the structure as built, see [ARCHITECTURE.md](ARCHITECTURE.md) — it is the authority where the two differ.
**Last updated:** 2026-08-20

This document is the source of truth for the build. Parity is judged against `design-reference/`, never against memory.

---

## 1. What the design actually contains

Six artboards, all consuming the `classical` design system. Verified by reading every file — nothing below is inferred.

| Design file          | Route         | Character                                                                                               |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| `Home.dc.html`       | `/`           | 10 sections; testimonial carousel with 7s autoplay; infinite marquee; conditional gallery               |
| `Notes.dc.html`      | `/scents`     | Full-viewport `scroll-snap` deck: hero + 8 scent slides + close; fixed right rail tracking active slide |
| `Experience.dc.html` | `/experience` | Hero + 3 alternating step blocks with 190px ghost numerals + interlude + 4-col includes + CTA           |
| `Events.dc.html`     | `/events`     | Header + 4 event-type cards (2×2) + CTA band                                                            |
| `About.dc.html`      | `/about`      | Story 2-col + founder quote + 3-col contact band on burgundy                                            |
| `Booking.dc.html`    | `/booking`    | Split layout: burgundy aside + form with bespoke calendar, slot picker, confirmation view               |

### Anchor contract

`Home` links into `Notes.dc.html#golds` and `#florals`. These must survive as `/scents#golds` (slide 1, Saffron Amber) and `/scents#florals` (slide 5, Citrus Rose).

### Runtime pieces to replace, not port

| Source                                                             | Replaced by                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `support.js` (`<x-dc>`, `<sc-if>`, `<sc-for>`, `{{ }}`, `DCLogic`) | React + JSX                                                 |
| `assets/hs-motion.js` (IntersectionObserver reveal)                | `<Reveal>` on `motion`, same 0.95s / 26px / brand-ease spec |
| `assets/image-slot.js` (drag-drop placeholder scaffold)            | `next/image` via `<Plate>`                                  |
| `assets/ios-frame.jsx`                                             | Unused by any page — drop                                   |
| `style-hover="…"` attribute                                        | CSS `:hover` through Tailwind variants                      |

---

## 2. Confirmed scope decisions

| Question               | Decision                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsive**         | The mockup has zero media queries and is desktop-only. I derive tablet/mobile from the design language and document every derived rule in `docs/RESPONSIVE.md`. Desktop stays pixel-faithful. |
| **Booking**            | Ships real: Next.js route handler, zod validation, Supabase-backed availability, `.ics` generation, confirmation email via Resend. The mockup's hash-based fake availability is replaced.     |
| **Unfinished content** | Founder name/bio/portrait and contact stubs ship as clearly-flagged placeholders driven from the content layer, so replacing them is a one-file edit. Nothing fake is presented as real.      |

---

## 3. Standing rules

These apply to every phase and are the anti-duplication contract. CI enforces items 2, 3 and 5.

1. **Reuse Gate.** Before adding any component, token, or style, search `src/components/primitives/index.ts`, `src/styles/globals.css`, and `src/content/`. If something matches ≥80%, extend it with a variant — never create a sibling. Record the check in the commit body.
2. **No raw values.** No hex, `rgba()`, `font-family`, or bare `px` outside `src/styles/globals.css`. Enforced by `scripts/audit-tokens.mjs`.
3. **One source per fact.** Every string, number, image path, and link lives in `src/content/`. Components take props and never hardcode copy.
4. **Thin routes.** `src/app/**/page.tsx` composes sections and exports metadata. No markup beyond composition.
5. **Nothing merges untested.** A primitive without a unit test and a `/dev` gallery entry does not land.
6. **Diff against the source.** Visual parity is judged against `design-reference/`, rendered in the same browser at the same width.

---

## 4. Stack

All versions verified against the npm registry on 2026-08-20. Peer-dependency compatibility checked across the whole set — see `docs/STACK-AUDIT.md` for the raw findings.

Node 24.13 / npm 11.11 confirmed locally. Next 16 requires Node ≥ 20.9, so the local toolchain is fine. No pnpm or bun present, so npm is the package manager.

**Runtime**

| Package                                | Version    | Why this one                                                                                                                                                                    |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`                                 | **16.3.1** | Turbopack is now the default bundler for dev _and_ build. Async request APIs, Cache Components, and the `proxy` convention all land here                                        |
| `react` / `react-dom`                  | **19.2.8** | View Transitions, `useEffectEvent`, `Activity`                                                                                                                                  |
| `tailwindcss` + `@tailwindcss/postcss` | **4.3.3**  | CSS-first `@theme` maps directly onto the `classical` token sheet. Next routes Tailwind through the PostCSS plugin, not the Vite plugin                                         |
| `class-variance-authority`             | 0.7.1      | The variant layer. Dormant but feature-complete — one `Button` with three variants covers all seven hand-styled anchors                                                         |
| `clsx` + `tailwind-merge`              | latest     | Class composition                                                                                                                                                               |
| `motion`                               | **13.1.0** | Reveal, crossfade, stagger, with first-class `useReducedMotion`                                                                                                                 |
| `react-hook-form`                      | **7.85.0** | Booking form                                                                                                                                                                    |
| `zod`                                  | **4.4.3**  | Schema shared between client validation and the route handler                                                                                                                   |
| `@hookform/resolvers`                  | **5.9.1**  | Verified: peer accepts `zod ^3.25 \|\| ^4.0`, so Zod 4 is supported                                                                                                             |
| `@daypicker/react`                     | **10.0.1** | **Renamed** — v10 moved off the `react-day-picker` package name. Headless, real ARIA grid semantics and keyboard nav, which the mockup's hand-rolled button grid has neither of |
| `date-fns`                             | 4.4.0      | Month math                                                                                                                                                                      |
| `lucide-react`                         | **1.33.0** | The `classical` readme mandates Lucide                                                                                                                                          |
| `@supabase/supabase-js`                | 2.112.3    | Availability + booking persistence                                                                                                                                              |
| `resend`                               | 6.20.0     | Confirmation emails                                                                                                                                                             |
| `ics`                                  | 3.12.0     | Calendar attachment                                                                                                                                                             |

**Fonts.** `next/font/google` self-hosts Cormorant Garamond + Lora and exposes them as `--font-heading` / `--font-body`, replacing the render-blocking `@import` at the top of the source stylesheet.

**Tooling**

| Package                                    | Version             | Note                                                                       |
| ------------------------------------------ | ------------------- | -------------------------------------------------------------------------- |
| `typescript`                               | **6.0.3 — pinned**  | See the blocker below. Do **not** take TypeScript 7                        |
| `typescript-eslint`                        | 8.67.0              | Peer range is `typescript >=4.8.4 <6.1.0`                                  |
| `eslint` + `eslint-config-next`            | **10.8.1** / 16.3.1 | Flat config only. `eslint-config-next` peer is `eslint >=9`, so 10 is fine |
| `prettier` + `prettier-plugin-tailwindcss` | 3.x / 0.8.1         | Class sorting                                                              |
| `vitest`                                   | **4.1.11**          | Unit + component                                                           |
| `@playwright/test`                         | 1.62.1              | E2E, visual regression                                                     |
| `@axe-core/playwright`                     | 4.13.0              | Accessibility sweeps                                                       |
| `knip`                                     | **6.32.2**          | Unused files, exports, dependencies                                        |
| `babel-plugin-react-compiler`              | 1.0.0               | Only if React Compiler is enabled — see §4.2                               |

### 4.1 Blocker: TypeScript 7 breaks type-aware linting

TypeScript 7.0.2 is the current `latest` — the Go-native compiler from Project Corsa, roughly 10× faster. **It cannot be used here.**

TypeScript 7 ships without a stable programmatic compiler API; that is scheduled for 7.1. `typescript-eslint@8.67.0` declares its peer range as `typescript: >=4.8.4 <6.1.0` and consumes that API directly, so type-aware lint rules — the `strict-type-checked` config this plan depends on — cannot run against TS 7 at all.

**Resolution:** pin `typescript@6.0.3`. It is the newest release inside the supported range, and Next 16 only requires ≥ 5.1.0. Revisit once typescript-eslint ships TS 7 support; the upgrade is then a version bump, because nothing else in the stack is coupled to the compiler.

### 4.2 Decisions this plan makes explicit

Three Next 16 features are stable but off by default. Each is a real fork and gets decided here rather than drifted into.

| Feature                                        | Decision                | Reasoning                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Compiler** (`reactCompiler: true`)     | **On**, from Phase 1    | Auto-memoization is worth it for the scroll-tracking scent rail and the testimonial carousel — the two places manual `useMemo`/`useCallback` would otherwise accumulate. Cost is slower builds, since it runs through Babel. Accepted for a 6-page site                                                                 |
| **Cache Components** (`cacheComponents: true`) | **Off** for v1          | Under Cache Components all dynamic code runs at request time and caching becomes opt-in via `use cache`. Five of six routes are fully static marketing pages that prerender correctly today. Adopting it would add a caching model to reason about for no gain. Revisit if the booking route needs partial prerendering |
| **React 19.2 View Transitions**                | **Evaluate in Phase 6** | The obvious fit is `/scents` slide transitions and cross-route navigation. Evaluated against the hand-rolled Motion work; whichever produces less code for the same result wins. Not committed to blind                                                                                                                 |

### 4.3 Next 16 behaviors that affect this specific design

These are not general upgrade notes — each one touches something the artboards actually do.

- **`scroll-behavior` is no longer overridden during navigation.** Every artboard sets `html{scroll-behavior:smooth}`, and `/scents` adds `scroll-snap-type: y mandatory` with `scroll-padding-top:79px`. Previous Next versions forced `scroll-behavior:auto` during route transitions so navigation felt instant. Next 16 stops doing that, so a nav click would smooth-scroll the entire document — and on `/scents` it would fight the mandatory snap container. **Fix:** set `<html data-scroll-behavior="smooth">` in the root layout to restore the override.
- **`images.qualities` now defaults to `[75]`.** Any other `quality` prop is silently coerced to the nearest allowed value. Must be configured explicitly if the photography needs more than one level.
- **`images.minimumCacheTTL` moved from 60s to 4 hours** and **`16` was dropped from `imageSizes`**. Both fine for this site, but recorded so the change is deliberate.
- **`middleware.ts` is now `proxy.ts`**, runs on the Node runtime only, and cannot use the edge runtime. This is where booking rate limiting and security headers go.
- **`next lint` is removed** and `next build` no longer lints. ESLint runs as its own CI step.
- **`next build` no longer reports `size` / `First Load JS`** — Vercel removed them as inaccurate for React Server Components. See the Phase 9 correction.

## 5. Folder structure

```
heirloom_scents_website/
├── design-reference/              # read-only. Never imported by app code.
│   ├── pages/*.dc.html            #   the 6 artboards, verbatim
│   ├── ds/classical/              #   styles.css, readme.md, manifests
│   ├── runtime/                   #   support.js, hs-motion.js, image-slot.js
│   ├── assets-raw/                #   originals before optimization
│   └── EXTRACTION.md              #   provenance + checksums
│
├── proxy.ts                       # Next 16 renamed middleware.ts → proxy.ts (Node runtime only)
├── instrumentation.ts             # error monitoring hook
├── AGENTS.md                      # version-matched Next docs pointer (see Phase 1)
│
├── src/
│   ├── app/                       # routing only — thin
│   │   ├── layout.tsx  page.tsx
│   │   ├── loading.tsx            #   Suspense boundary — was missing from v1 of this plan
│   │   ├── error.tsx  global-error.tsx  not-found.tsx
│   │   ├── scents/  experience/  events/  about/  booking/
│   │   ├── api/bookings/route.ts  api/availability/route.ts
│   │   ├── dev/                   #   token + primitive galleries (dev-only)
│   │   └── sitemap.ts  robots.ts  opengraph-image.tsx
│   │
│   ├── components/
│   │   ├── primitives/            # the reuse layer — atoms
│   │   │   ├── button/ arrow-link/ eyebrow/ heading/ plate/
│   │   │   ├── rule/ emblem/ number-mark/ field/
│   │   │   └── index.ts           #   barrel; the Reuse Gate searches this first
│   │   ├── layout/                # site-header/ site-footer/ section/ dark-band/
│   │   ├── motion/                # reveal/ ken-burns/ marquee/ scroll-cue/ stagger/
│   │   ├── patterns/              # composed, page-agnostic blocks
│   │   │   ├── cta-band/ photo-interlude/ step-row/ combination-card/
│   │   │   ├── event-type-card/ included-item/ testimonial-carousel/
│   │   │   └── scent-slide/ scent-rail/ numbered-stat/
│   │   └── sections/              # page-specific compositions
│   │       └── home/ scents/ experience/ events/ about/ booking/
│   │
│   ├── features/booking/          # the one feature with real logic
│   │   ├── components/            #   BookingForm, AvailabilityCalendar, SlotPicker, Confirmation
│   │   ├── lib/                   #   availability.ts, ics.ts, mailer.ts
│   │   ├── schema.ts  types.ts  use-booking.ts
│   │
│   ├── content/                   # typed, zod-validated, single source per fact
│   │   ├── scents.ts  combinations.ts  event-types.ts
│   │   ├── experience-steps.ts  included.ts  testimonials.ts
│   │   ├── navigation.ts  site.ts  image-manifest.ts  placeholders.ts
│   │
│   ├── styles/
│   │   ├── theme.css              #   @theme — the ONLY place tokens are declared
│   │   ├── tokens.css             #   :root — only values that must NOT emit utilities
│   │   ├── keyframes.css  globals.css
│   │   └── tokens.audit.md        #   every raw mockup value → its token
│   │
│   ├── lib/                       # cn.ts  env.ts  seo.ts  supabase.ts  headers.ts  rate-limit.ts
│   └── types/
│
├── public/images/{brand,scents,photos}/
├── tests/{unit,e2e,a11y,visual}/
├── scripts/{extract-design.mjs,audit-tokens.mjs,audit-reuse.mjs}
└── docs/{BUILD_PLAN,ARCHITECTURE,RESPONSIVE,CONTENT,DESIGN-PARITY,DEPLOY}.md
```

**Why `app/` stays thin.** Routing concerns live in `app/`; everything visual lives in `src/components/`. Sections are named by page but live in the component tree so they are discoverable by the Reuse Gate — a section buried in a route folder is a section nobody finds before duplicating it.

---

## 6. Phases

### Phase 0 — Extract the design into the repo

Every byte of the design lands locally first, so implementation diffs against files rather than recollection.

- Write the 6 `.dc.html` artboards, `classical/styles.css`, the readme, and the three runtime scripts into `design-reference/`.
- Extract all **31 binary assets** via `DesignSync.get_file` (base64, confirmed working) and decode into `public/images/`, sorted `brand/` (3 emblems), `scents/` (8 bottles + 9 backgrounds), `photos/` (11).
- Generate `src/content/image-manifest.ts` with real dimensions from `sharp`, so every `next/image` gets explicit width/height and the site ships zero CLS.
- Exclude `uploads/` and `screenshots/` — those are working files from the design session, not production assets.

**Finding already confirmed:** 23 of the 31 images are referenced by the artboards. The 8 `bg-<scent>.png` files (`bg-berry-cloud`, `bg-citrus-rose`, `bg-golden-vanilla`, `bg-ivory-petals`, `bg-lychee-rose`, `bg-midnight-vanilla`, `bg-saffron-amber`, `bg-velvet-coffee`) are referenced by nothing — the scent slides use `bottle-*` instead. They are extracted but quarantined, not shipped, pending a call on whether they were intended as slide backgrounds.

> **Gate 0** — checksum every extracted file against the remote listing; assert 6/6 pages and 31/31 assets present and non-empty; `EXTRACTION.md` records provenance.

---

### Phase 1 — Toolchain and foundation

**Step one, before any code:** run `npx @next/codemod@canary agents-md` to generate `AGENTS.md`. Next 16 ships version-matched documentation inside `node_modules/next/dist/docs/`, and the generated block instructs any agent working in this repo to read it before writing code. This is not optional housekeeping — the first draft of this plan named Next 15 patterns throughout precisely because it was written from recall rather than version-matched docs.

Then `create-next-app` (TypeScript, Tailwind v4, App Router, `src/`, `@/*` alias), and the config layer: `tsconfig` with strict plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; ESLint flat config; Prettier with the Tailwind class sorter; husky + lint-staged; GitHub Actions running `typecheck → lint → unit → build → e2e → audits`.

Pin `typescript@6.0.3` in `package.json` with a comment pointing at §4.1, so nobody "helpfully" bumps it to 7 and silently loses type-aware linting.

Turbopack needs no flag — it is the default in 16 for both `dev` and `build`. Drop `--turbopack` from any scripts copied from older guides.

> **Gate 1** — `npm run verify` green on the empty app; CI green on a throwaway PR; `AGENTS.md` present and pointing at the bundled docs.

---

### Phase 2 — Token and theme layer

The `classical` tokens port verbatim **into `@theme`, not `:root`** — all 27 ramp steps, the space scale, radii, shadows. In Tailwind v4, `@theme` both emits the custom properties _and_ generates the matching utilities, so declaring them in `:root` and again in `@theme` would define every color twice — exactly the duplication this phase exists to remove. `:root` is reserved for the few values that must _not_ generate utilities (`--nav-h`, `--ease-brand`). On top of the port goes the **brand layer**, which is the set of values the artboards use raw and which currently have no token:

| New token                         | Value                            | Occurrences in mockup                                |
| --------------------------------- | -------------------------------- | ---------------------------------------------------- |
| `--brand-burgundy`                | `#400d15`                        | 12 (every dark band ground)                          |
| `--brand-cream`                   | `#f1e8da`                        | ~60 (all text on burgundy)                           |
| `--brand-burgundy-deep`           | `#3a0a11`                        | overlay base for `rgba(58,10,17,…)`                  |
| `--brand-burgundy-lift`           | `#551620`                        | radial highlight, `rgba(85,22,32,…)`                 |
| `--brand-error`                   | `#7a1f2b`                        | booking validation                                   |
| `--ease-brand`                    | `cubic-bezier(0.22,0.61,0.36,1)` | ~20                                                  |
| `--nav-h`                         | `79px`                           | drives `calc(100vh - 79px)` and `scroll-padding-top` |
| `--content-max` / `--content-pad` | `1180px` / `56px`                | every section wrapper                                |

**Two collapses that remove most of the mockup's duplication:**

- **Alpha sprawl.** The artboards use 28 distinct ad-hoc `color-mix()` percentages against ink and cream (82%, 78%, 74%, 70%, 68%, 66%, 64%, 62%, 60%, 55%, 52%, 48%, 45%, 30%, 26%, 18%, 14%…). These collapse into two named scales, `--ink-{90…30}` and `--cream-{90…15}`.
- **Type sprawl.** 29 distinct font sizes appear across the six pages (96, 88, 76, 72, 64, 52, 48, 46, 44, 42, 40, 34, 32, 30, 27, 26, 22, 19, 18, 17, 15, 14.5, 14, 13.5, 12.5, 11.5, 11, 10.5, 9). These collapse into a named scale — `display-{1..4}`, `heading-{1..3}`, `body-{lg,md,sm}`, `kicker-{lg,md,sm}` — with `clamp()` applied in Phase 8.

The full mapping from raw mockup value to token is recorded in [DESIGN-PARITY.md](DESIGN-PARITY.md); `scripts/audit-tokens.mjs` enforces Rule 2 mechanically.

> **Gate 2** — `scripts/audit-tokens.mjs` proves zero raw color/size values outside `tokens.css`; `/dev/tokens` renders every token; computed values are diffed against `classical/styles.css` to prove the port is lossless.

---

### Phase 3 — Primitives

Each primitive is a folder of `component.tsx`, `component.variants.ts` (cva), `component.test.tsx`, `index.ts`. Counts below are actual occurrences in the artboards — they are the justification for each primitive existing.

| Primitive                                   | Variants                                                  | Replaces                           |
| ------------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| `Button` / `ButtonLink`                     | `outline-accent`, `outline-cream`, `ghost` × `sm\|md\|lg` | 7 hand-styled anchors              |
| `ArrowLink`                                 | `accent`, `cream`                                         | 8 underline-plus-arrow links       |
| `Eyebrow`                                   | `lg` (11px/.24em), `md` (10.5px/.22em), `sm` (9px/.30em)  | 15 kickers                         |
| `Plate`                                     | with/without hover zoom, aspect ratios                    | 12 `.plate` + `<image-slot>` pairs |
| `Emblem`                                    | `burgundy`, `cream`, `gold` × size                        | 12 logo images                     |
| `NumberMark`                                | `inline`, `display`, `ghost` (the 190px watermarks)       | 20 tabular numerals                |
| `Rule`                                      | `hairline`, `spaced`                                      | 5 dividers                         |
| `Heading`                                   | polymorphic `as`, display scale                           | all headings                       |
| `Input` / `Select` / `Label` / `FieldError` | —                                                         | booking form                       |

> **Gate 3** — every primitive has unit tests, an entry on `/dev/primitives`, and an axe pass; `knip` reports zero unused exports; a grep proves no section re-implements a primitive's styles.

---

### Phase 4 — Layout and motion shells

**Layout.** `SiteHeader` (sticky, `usePathname()` active state, mobile drawer, height locked to `--nav-h`); `SiteFooter` with cva variants `centered` / `split` / `on-dark` / `booking` covering the four footers in the design; `Section`; `DarkBand` (burgundy ground + overlay, used by every hero, CTA and interlude).

**Motion.** `Reveal` reimplements `hs-motion.js` exactly — 0.95s, `translateY(26px)`, brand ease, `rootMargin: 0px 0px -8% 0px`, and the source's rule that elements already above 92% of the viewport never animate. `KenBurns` (22s/24s alternate), `Marquee` (36s linear, duplicated track), `ScrollCue`, and `Stagger` for the hero's 0.1 → 1.1s delay sequence.

Every motion primitive short-circuits on `useReducedMotion()`, matching the source's `prefers-reduced-motion` bail-out.

> **Gate 4** — reduced-motion snapshot proves layout is intact with all animation disabled; header active-state test per route; footer variant tests.

---

### Phase 5 — Content layer

All copy, data and image references move into `src/content/*.ts` behind zod schemas validated at build time. The scent model carries the per-slide overlay tint, so the 8 bespoke gradients live with their scent rather than in markup.

`placeholders.ts` flags unfinished content (`isPlaceholder: true`) so a build-time report lists exactly what is still stubbed — the founder block and the contact details.

> **Gate 5** — zod parse fails the build on missing fields; tests assert every referenced image exists on disk, every `pairings[]` entry resolves to a real scent slug, and the `#golds` / `#florals` anchors land on the right slides.

---

### Phase 6 — Page sections, route by route

Order: Home → Experience → Events → About → Scents. Booking is Phase 7.

Per route the loop is: compose from primitives and patterns → render the reference `.dc.html` and the built route side by side at 1440px → run the reuse audit → commit.

Patterns extracted along the way, with their use counts: `CtaBand` (4), `PhotoInterlude` (2), `StepRow` (4), `CombinationCard` (4), `EventTypeCard` (4), `IncludedItem` (4), `NumberedStat` (3), `TestimonialCarousel` (1), `ScentSlide` (8), `ScentRail` (1).

`/scents` is the most intricate: `scroll-snap-type: y mandatory`, slides at `calc(100vh - var(--nav-h))`, and a fixed rail whose active index is derived from a scroll listener. The rail becomes a `useActiveSection` hook driven by IntersectionObserver rather than a scroll handler — same behavior, no per-frame `getBoundingClientRect()` over 8 nodes.

> **Gate 6, per route** — Playwright screenshot diff against the reference at ≤2% delta on layout-critical regions; axe zero violations; `knip` clean; token audit clean.

---

### Phase 7 — Booking, full-stack

**Client.** `BookingForm` on react-hook-form + zod with accessible error wiring; `AvailabilityCalendar` on react-day-picker styled to the mockup (square cells, accent border on selection, greyed disabled days, month nav clamped to +3); `SlotPicker`; `Confirmation` rendering the invite summary card.

**Server.** `GET /api/availability?month=` returns real closed days and taken slots from Supabase, replacing the mockup's `hash(iso) % 7` fake. `POST /api/bookings` validates against the shared zod schema, re-checks availability server-side, and inserts behind a `UNIQUE (date, slot)` constraint so two simultaneous submissions cannot double-book. On success it generates an `.ics` and sends guest and host emails through Resend.

`src/lib/env.ts` validates `process.env` with zod and fails fast at boot.

Anti-abuse: honeypot field, rate limiting, and Cloudflare Turnstile on submit. Rate limiting lives in `proxy.ts` — Next 16's rename of `middleware.ts`. Because `proxy` runs on the Node runtime only and cannot use the edge runtime, a Redis-backed limiter (Upstash) replaces any edge-native approach.

> **Gate 7** — unit tests on availability rules and schema; integration tests against a Supabase branch; E2E covering the happy path and every validation error; an explicit double-booking race test; `.ics` and email snapshot tests; a bundle grep proving no server secret reaches the client.

---

### Phase 8 — Responsive

Breakpoints `sm 640 / md 768 / lg 1024 / xl 1280`. The mockup's native width is 1440 and stays pixel-faithful. Every derived rule is recorded in `docs/RESPONSIVE.md` so it is reviewable as a design decision, not buried in classes.

- Nav collapses to a drawer below `lg`; wordmark drops below `sm`.
- Every `1.1fr 1fr` and `repeat(2,…)` grid stacks below `lg`. The `repeat(4,…)` includes row goes 4 → 2 → 1.
- Display type moves to `clamp()` on the Phase 2 scale (the 96px hero floors at 40px).
- `/scents` keeps the snap deck at `lg` and above; below that it becomes a vertical stack of full-bleed cards and the rail becomes dot indicators.
- Booking's split becomes stacked, with the burgundy aside reduced to a short header band.
- Section padding `56px → 24px` below `md`.

> **Gate 8** — the full E2E and axe suites run at 375 / 768 / 1024 / 1440; a zero-horizontal-overflow assertion on every route at every width; tap targets ≥ 44px.

---

### Phase 9 — End-to-end audit

**Code.** `tsc --noEmit` zero errors · ESLint zero warnings · `knip` zero unused files, exports or dependencies · `audit-tokens.mjs` zero raw values · `audit-reuse.mjs` flags any two components sharing more than a threshold of identical declarations · `npm audit` clean.

**Bundle budgets — corrected method.** Next 16 removed `size` and `First Load JS` from the build output, having found them inaccurate for React Server Component architectures. Budgets are therefore enforced against measured resource sizes from Lighthouse CI and the Playwright network log, not build-output numbers. `@next/bundle-analyzer` stays, but for _inspecting_ what landed in a chunk rather than for gating.

**UI.** Visual regression across 6 routes × 4 widths against `design-reference/` · `@axe-core/playwright` at WCAG 2.2 AA, zero violations · keyboard-only walkthrough per route (visible focus, sane order, no traps) · landmark and heading-order assertions · reduced-motion and forced-colors render checks · link integrity (every internal href and anchor target resolves) · image audit (every `next/image` has dimensions and correct `alt`, decorative images `alt=""`).

**Route-change focus management.** The App Router does not move focus on navigation, so keyboard and screen-reader users stay where they were while the page changes underneath them. Axe cannot detect this, which means "zero axe violations" is not on its own evidence of an accessible site. The build ships a skip link and a route announcer that moves focus to the new page's `<h1>`, and the E2E suite asserts focus lands correctly on every route transition.

**Security.** Response headers set in `proxy.ts` and verified by an E2E assertion: a Content-Security-Policy scoped to the Supabase, Resend and Turnstile origins; `Strict-Transport-Security`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; and a `Permissions-Policy` denying camera, microphone and geolocation. The booking route is the only public write path in the app, so it also gets a dependency-CVE gate and a check that no `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` string appears in any client chunk.

**Content and SEO.** Per-route metadata, OG images, sitemap, robots, `LocalBusiness` + `Service` JSON-LD. Lighthouse CI budgets: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100. Placeholder report printed so nothing stubbed ships silently.

---

### Phase 10 — Ship

Vercel project with per-PR preview deploys and environment variables; analytics; `docs/` completed (ARCHITECTURE, RESPONSIVE, CONTENT, DESIGN-PARITY, DEPLOY); README rewritten off the placeholder scaffold.

`DESIGN-PARITY.md` records every intentional deviation from the mockup with its reason — the responsive rules, the real availability backend, the accessible calendar swap — so future contributors do not "fix" them back.

---

## 7. Open items

| Item                                                                 | Needed by   | Owner  |
| -------------------------------------------------------------------- | ----------- | ------ |
| Founder name, bio, portrait                                          | Phase 5     | Client |
| Confirmed contact email and phone                                    | Phase 5     | Client |
| Whether the Home gallery ships on (`showGallery` prop defaults true) | Phase 6     | Client |
| Intent of the 8 unreferenced `bg-<scent>.png` assets                 | Phase 0     | Client |
| Supabase project + Resend domain verification                        | Phase 7     | Client |
| Real event photography to replace generated placeholders             | Post-launch | Client |
