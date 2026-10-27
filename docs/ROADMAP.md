# Roadmap

What is left to build, in the order it is worth building, with the decisions
each phase depends on.

The site is live at heirloomscents.com and matches the redesigned Claude Design
project. `docs/DESIGN-PARITY.md` records every deviation; `docs/DEPLOYMENT.md`
covers environment and backends.

---

## The three decisions to make first

### 1. Booking: Calendly, free plan — DECIDED

The booking screen is built and beautiful, and it is still the wrong thing to
own.

**The deciding argument is double-booking.** The current implementation has no
connection to anyone's real calendar. `StaticAvailability` reports every
non-Sunday, non-Monday slot as free, so it will take a 3:00 PM consultation that
is already a dentist appointment, and nothing in the codebase can know otherwise
without integrating Google or Outlook — which is most of what a scheduling
product is. Reminders, reschedule, cancellation, timezone and DST correctness,
and an owner-facing dashboard are all unbuilt and all standard in a scheduler.

It also removes **Supabase and Resend from the critical path**: the booking stops
evaporating the day it is embedded, with no API keys to provision.

**Free plans differ sharply, and it decides which one.**

|                      | Calendly free         | Cal.com free                     |
| -------------------- | --------------------- | -------------------------------- |
| Event types          | **One**               | Unlimited                        |
| Calendar connections | **One**               | Unlimited                        |
| Reminders            | **Paid only**         | Included                         |
| Payments             | Paid only             | Included                         |
| Theming              | Brand colour and font | Deeper; also self-hostable (MIT) |
| Next tier up         | $10/seat/mo annual    | ~$12/user/mo annual              |

**Decision: Calendly, free plan.** The two limits that argued against it do not
apply here. One event type is enough — the occasion (wedding, graduation, other)
is a question on the booking form, not a separate event type. Reminders are paid
only, and are not needed because the consultation lands on the owner's real
calendar. Video conferencing is free on every Calendly plan, so the booking
creates its own Teams, Meet or Zoom link.

No payment is taken: the consultation is free.

Note the mechanics, because they are often misread. The booking does not send an
email that then has to create an invite. Calendly writes the event straight into
the owner's connected calendar with the video link attached, and emails both
sides as a notification.

**What it costs in code — revised.** The first plan replaced the right column
with Calendly's inline embed (PR #4, closed unmerged). The owner wanted the
site's own form kept, with a phone number, a free-text "Other" occasion and
notes. So the form stays and Calendly sits behind it:

- The calendar and times are **read live** from Calendly's API with a read-only
  token. Free plan, no upgrade needed for this.
- **Booking through the API is paid-only** (Standard, $10–12/month). On free,
  Reserve opens Calendly's own window at the chosen time with every answer
  pre-filled, and the guest clicks Schedule Event. Upgrading later would let
  Reserve book directly; the form and availability code would not change.

Deleted as planned: `availability.ts`, `store.ts`, `notify.ts`, `ics.ts`, the
bookings route, `src/lib/env.ts` and their tests, plus the `ics` dependency.
Kept: the calendar, the time picker, the form and the confirmation screen.

### 2. Commerce: Shopify as the engine, this site as the storefront

Two separate jobs. Do not conflate them.

**A deposit taken at booking** → Stripe, or Cal.com's built-in payments. No
catalogue, no shipping. Days.

**Bottles that ship to customers** → Shopify. The reason is not the cart; carts
are easy. It is everything behind the cart: sales-tax nexus, live carrier rates,
inventory, refunds, fulfilment, and an admin a non-technical owner can run
without a developer. That is months to build here and then yours to maintain
forever.

Three prebuilt routes, all real, with their actual costs:

|                     | Monthly                     | Per sale       | Checkout               | Admin & fulfilment |
| ------------------- | --------------------------- | -------------- | ---------------------- | ------------------ |
| **Shopify Starter** | $5                          | 5% + 30¢       | Shopify-hosted         | Full               |
| **Shopify Basic**   | $39                         | card rates     | Shopify-hosted         | Full               |
| **Snipcart**        | $20 floor, then 2% of sales | + gateway fees | **Stays on your site** | Thinner            |

At roughly $1,000/month in sales these land within about $20 of each other. By
$5,000/month Shopify Basic is the cheapest of the three, because its 2.9%-ish
card rate beats Starter's flat 5% and Snipcart's 2% _plus_ gateway.

**Recommended: Shopify Basic, surfaced headlessly through this Next.js app.**
The Storefront API reads products, this app renders the listing, the detail page
and the cart in the existing design, and checkout hands off to Shopify's hosted
checkout. Shopify's own documentation and plan terms allow exactly this on
Basic — the $40k–150k figures quoted around "headless Shopify" are agency build
costs, not a platform requirement.

Why not the other two:

- **Snipcart** keeps checkout on-site, which is genuinely nicer, but leaves you
  writing shipping logic through webhooks and bolting on a tax service. For a
  product with carrier restrictions that is the wrong place to be improvising.
- **Shopify Starter** at 5% + 30¢ is the fastest possible start and a fine way
  to test demand for a month, but the rate is punitive past a few hundred
  dollars a month.

**Fastest possible path if the design can wait:** Shopify Basic with a themed
store on `shop.heirloomscents.com`, linked from the nav. Days, not weeks, and it
can be replaced by the headless version later without changing Shopify.

> **The constraint that decides whether retail is viable at all:** alcohol-based
> perfume is a flammable liquid. It ships as a limited quantity / ORM-D ground
> shipment, and most carriers restrict or refuse it by air for consumer parcels.
> This is an operations question, not a platform one — but it is also the single
> strongest argument for Shopify, whose shipping profiles and carrier apps are
> built for exactly this kind of restriction.

### 3. Social icons need a brand-icon set

Lucide **removed its brand icons** — `Instagram`, `Facebook`, `Twitter` and
`Youtube` are all absent from its 6,299 exports, and TikTok never existed there.
Use [Simple Icons](https://simpleicons.org), either as the `simple-icons`
package or as two inline SVG paths.

The artboards draw **no** social icons anywhere, so this is a small design
addition rather than a port. `@heirloomscents` currently appears as plain text
in the home footer and the About contact block.

---

## Phase 1 — Calendly behind the site's own form

The hand-built calendar stays; what it showed was fake. It now shows Calendly's
live availability, and Calendly makes the booking. Supabase, Resend, Turnstile,
`.ics` generation and the hard-coded trading rules go — Calendly owns all of
that. See decision 1 for why the form was kept rather than embedding Calendly.

### Calendly — done 2026-10-27

- [x] Calendly account, free plan
- [x] Connect the owner's real calendar, so it cannot double-book
- [x] One event type: 30 minutes, "Heirloom Scents consultation", video link
- [x] Questions: Phone number, Occasion (one line), Anything else we should know?
- [x] Read-only token (`users:read`, `event_types:read`) in Vercel as
      `CALENDLY_TOKEN`, Sensitive, Production and Preview

### Build — done

- [x] `/api/availability` reads open times live from Calendly, cached 60s at the
      edge; the calendar greys every day Calendly has no time on
- [x] Times shown in the visitor's own zone, labelled with it
- [x] Required phone, normalised to E.164; "Other" opens a free-text occasion;
      optional notes
- [x] Reserve opens Calendly's window at the chosen time, every answer
      pre-filled; the confirmation waits for Calendly's `event_scheduled`
- [x] Honest fallbacks: no token → Instagram panel; Calendly down → retry
- [x] CSP admits exactly `assets.calendly.com` (script, style, img) and
      `calendly.com` (frame)
- [x] e2e against a local stand-in for Calendly's API, at all four viewports

### Deleted

- [x] `availability.ts`, `store.ts`, `notify.ts`, `ics.ts`, `format.ts`, the
      bookings route, `src/lib/env.ts`, and their tests
- [x] The `ics` dependency; `SITE.hostEmail`; the honeypot (there is no server
      submit for a bot to reach)

### Gate

- [x] `npm run verify` green, `knip` reporting zero unused files, exports or
      dependencies
- [ ] A real test booking on a preview: pre-filled answers arrive in Calendly
      (phone format included), the event lands on the calendar with a working
      meeting link, both emails arrive, the time disappears from the calendar
      within a couple of minutes

This closes the item that matters most: the live site currently takes enquiries
and loses them.

## Phase 2 — The brand surface

Cheap, visible on every visit and every share, needs nothing from anyone.

- [ ] **Favicon and app icons** — there are none; every browser tab shows a
      blank page icon. `app/icon.png` and `app/apple-icon.png` from
      `hs-mark.png`
- [ ] **OG image** — links shared to Instagram or iMessage render with no
      picture, and `twitter:card` already claims `summary_large_image` with no
      image behind it
- [ ] **Social icons** — Instagram and TikTok from Simple Icons, since Lucide
      dropped brand marks. In the home footer's contact column and the About
      contact block
- [ ] **`/privacy` and `/terms`** — content already written in
      `~/Desktop/Business Infra/legal-pages-handoff/`. Two routes, two footer
      links, both added to `sitemap.ts` and the a11y and smoke specs

## Phase 3 — Shopify Basic, storefront in this app

$39/month, or $29 annual. Shopify Payments on, which also exempts PayPal from
Shopify's third-party surcharge and brings Apple Pay, Google Pay and Shop Pay
with it.

### Shopify side

- [ ] Shopify Basic account; Shopify Payments activated
- [ ] Connect PayPal alongside it, so US buyers get Venmo
- [ ] Products: the scent library — price, weight, inventory, photos
- [ ] **Shipping profile: ground only.** Alcohol-based perfume is a flammable
      liquid. USPS ground only, 16 fl oz per parcel, hazard declared at label
      purchase, Hazmat Label 876, surface-only marking, absorbent packing.
      USPS Ground Advantage carries no hazmat handling fee; a mis-declared
      parcel costs $50
- [ ] Texas sales tax registration; Shopify Tax on
- [ ] Refund, shipping and privacy policies published
- [ ] Order notification email pointed at the owner; Shopify mobile app
      installed for push
- [ ] Brand the hosted checkout — logo, colours, fonts

### This app

- [ ] `@shopify/storefront-api-client`, tokens in Vercel env
- [ ] `/shop` listing, product detail, and a cart — all in the existing design
- [ ] Hand off to Shopify's hosted checkout. On Basic the checkout is on
      `myshopify.com` or `shop.app` and cannot move to our domain; a custom
      checkout domain is Plus only, at roughly $2,300/month. Accepted
- [ ] `/shop` in the nav and the footers
- [ ] e2e: listing renders, a product page renders, add-to-cart updates the
      cart, and checkout hands off
- [ ] Tracking needs no work — "Track with Shop" is on by default and gives
      customers status, notifications and the live map

## Phase 4 — Finish what the design implies

- [ ] **Newsletter backend.** Today the form validates and then says the list
      is not open. Wire a provider, or remove the band
- [ ] **Analytics.** None installed
- [ ] **Founder block.** A portrait and two sentences
- [ ] **`--nav-h` vs the real mobile header.** The token is 79px; the header is
      155–176px on a phone because it wraps, so `/scents#golds` lands with part
      of the slide behind it. Measuring it at runtime would also change the
      desktop slide height from the design's 821px, so this needs a deliberate
      choice
- [ ] `NEXT_PUBLIC_SITE_URL` set in Vercel

## Phase 5 — Deposits, only if wanted

The consultation is free, so this is for event retainers, not booking.

- [ ] Decide whether a retainer is taken, and how much
- [ ] Calendly's native Stripe integration, or a Stripe invoice sent after the
      consultation
- [ ] Refund terms in the terms page

---

## Ongoing

- [ ] Watch video bandwidth and image-optimization usage on the hobby plan
- [ ] Keep `announcement.notice` in `src/content/site.ts` current — it names a
      season and a year, and is the one string that goes stale on a calendar
- [ ] Exclude this folder from whatever syncs `~/Desktop`. It has duplicated
      files into the working tree and once into `.git`, where it broke `git`
      outright
