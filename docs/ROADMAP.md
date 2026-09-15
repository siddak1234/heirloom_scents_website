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

**What it costs in code:** the artboard's left aside stays exactly as drawn —
night panel, mark, the three numbered steps. The right column hosts an inline
embed instead of the hand-built calendar. Deleted: `availability-calendar.tsx`,
`slot-picker.tsx`, `availability.ts`, `store.ts`, both API routes, `ics.ts`, and
their tests.

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

## Phase 1 — Stop losing bookings

The site is live and every enquiry currently evaporates. Nothing else in this
document matters as much.

- [ ] Create the Calendly account; connect the owner's real Google/Outlook
      calendar so it can never double-book
- [ ] Set the event type: 30 minutes, video or phone, the artboard's four
      occasions as a required question
- [ ] Set brand colour `#b68235`; add the occasion question (wedding,
      graduation, other) to the booking form
- [ ] Embed inline in the booking page's right column; keep the aside as drawn
- [ ] Delete the superseded calendar, slot picker, availability lib, store,
      both API routes, `ics.ts`, and their tests
- [ ] Remove `@daypicker/react`, `date-fns` and `ics` if nothing else uses them
- [ ] Rewrite the e2e booking spec against the embed
- [ ] Update `DEPLOYMENT.md` and `DESIGN-PARITY.md`

**If the custom calendar is kept instead**, this phase becomes: install
`resend`, implement `ResendNotifier`, flip the seam in `store.ts`, set
`RESEND_API_KEY`, verify the sending domain, then add Supabase persistence so
two people cannot take the same slot.

**Either way, today:** make the confirmation stop claiming delivery. It says
_"Two calendar invites have just been sent"_ when nothing is sent. One
conditional on `hasEmailBackend` tells the truth now and restores the
artboard's copy the moment a transport exists.

- [ ] Confirmation copy conditional on whether delivery is wired

## Phase 2 — The brand surface

Cheap, visible on every visit and every share, and needs nothing from anyone.

- [ ] **Favicon and app icons** — there are none; every browser tab shows a
      blank page icon. `app/icon.png` + `app/apple-icon.png` from `hs-mark.png`
- [ ] **OG image** — links shared to Instagram or iMessage render with no
      picture, and `twitter:card` already claims `summary_large_image` with no
      image. `app/opengraph-image.tsx`, or a static export of the hero
- [ ] **Social icons** — Instagram and TikTok, Simple Icons, in the home
      footer's contact column and the About contact block
- [ ] **`/privacy` and `/terms`** — the content is written and sitting in
      `~/Desktop/Business Infra/legal-pages-handoff/` (101 and 72 lines). Two
      routes, two footer links, and the sitemap
- [ ] Add both routes to `sitemap.ts` and the a11y/smoke specs

## Phase 3 — Finish what the design implies

- [ ] **Newsletter backend.** The form validates and then says the list is not
      open. Wire a provider, or remove the band
- [ ] **Analytics.** None installed. Vercel Analytics is one line; anything
      else needs a consent banner alongside the privacy page
- [ ] **Founder block.** Ships as a labelled empty mat and "Founder name & bio
      to come". Needs a portrait and two sentences
- [ ] **`--nav-h` vs the real mobile header.** The token is 79px; the header is
      155–176px on a phone because it wraps, so `/scents#golds` lands with part
      of the slide behind it. Measuring it at runtime would also change the
      desktop slide height from the design's 821px — so this needs a deliberate
      choice, not a quiet fix
- [ ] `NEXT_PUBLIC_SITE_URL` set in Vercel

## Phase 4 — Take money at booking

Only worth doing once Phase 1 is settled, because it attaches to the booking
flow.

- [ ] Decide whether a deposit is taken, and how much
- [ ] Stripe account; decide Payment Link vs Checkout Session
- [ ] If Calendly: use its native Stripe integration — no code
- [ ] If custom: a Checkout Session from the booking route, with a webhook
      confirming the booking only on `payment_intent.succeeded`
- [ ] Refund and cancellation terms, in the terms page
- [ ] Test-mode end-to-end before going live

## Phase 5 — Products and orders

**Gated.** Nothing here can start until three things exist, and none of them is
code.

- [ ] **A decision that retail is happening at all**, given the shipping
      constraint above
- [ ] **Pricing.** There is no price anywhere in the six artboards or the
      codebase. Sizes, bundles, gift sets
- [ ] **Design.** The project has no product listing, product detail, cart,
      checkout, order confirmation or order status screen. These need drawing
      before anything is ported

Then, on Shopify Basic:

- [ ] Shopify Basic store; catalogue from the eight house scents
- [ ] Decide the surface: headless through this app (keeps the design) or a
      themed store on `shop.heirloomscents.com` (days, replaceable later)
- [ ] Shipping profiles reflecting the flammable-liquid restrictions
- [ ] Tax registration for the nexus states
- [ ] Order and fulfilment workflow the owner can run
- [ ] Returns policy, published
- [ ] If headless: `@shopify/storefront-api-client`, a listing page, a product
      page and a cart in the existing design, handing off to Shopify checkout
- [ ] Link it from the nav — the one change this site needs either way

---

## Ongoing

- [ ] Watch video bandwidth and image-optimization usage on the hobby plan
- [ ] Keep `announcement.notice` in `src/content/site.ts` current — it names a
      season and a year, and is the one string that goes stale on a calendar
- [ ] Exclude this folder from whatever syncs `~/Desktop`. It has duplicated
      files into the working tree and once into `.git`, where it broke `git`
      outright
