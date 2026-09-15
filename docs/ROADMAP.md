# Roadmap

What is left to build, in the order it is worth building, with the decisions
each phase depends on.

The site is live at heirloomscents.com and matches the redesigned Claude Design
project. `docs/DESIGN-PARITY.md` records every deviation; `docs/DEPLOYMENT.md`
covers environment and backends.

---

## The three decisions to make first

### 1. Booking: Calendly, not the custom calendar — recommended

The booking screen is built and beautiful, and it is the wrong thing to own.

**The deciding argument is double-booking.** The current implementation has no
connection to anyone's real calendar. `StaticAvailability` reports every
non-Sunday, non-Monday slot as free, so it will happily take a 3:00 PM
consultation that is already a dentist appointment. Nothing in the codebase can
know otherwise without integrating Google or Outlook — which is most of what a
scheduling product is.

The rest follows: reminders, reschedule, cancellation, timezone and DST
correctness, and a dashboard the owner can use without a developer. All unbuilt.
All standard in a scheduler.

Choosing Calendly also removes **Supabase and Resend from the critical path** —
the booking stops evaporating the day it is embedded, with no API keys to
provision and no persistence layer to write.

|         | Calendly                                   | Cal.com                      |
| ------- | ------------------------------------------ | ---------------------------- |
| Turnkey | Yes                                        | Mostly                       |
| Theming | Limited — brand colour and font only       | Deeper, and self-hostable    |
| Cost    | Free tier, ~$12/user/mo for the useful one | Free tier, self-host or ~$15 |

Pick **Calendly** unless the booking page's exact look matters more than the
time; then **Cal.com**.

**What it costs:** the artboard's left aside stays exactly as drawn — night
panel, mark, the three numbered steps. The right column hosts an inline embed
instead of the hand-built calendar. Deleted: `availability-calendar.tsx`,
`slot-picker.tsx`, `availability.ts`, `store.ts`, both API routes, and their
tests. `ics.ts` and the `.ics` unit tests go too — Calendly sends the invite.

**Keep the custom calendar only if** the booking page's pixel fidelity is worth
building calendar sync, reminders and reschedule flows yourself. It is not, for
a business this size.

### 2. Payments: Stripe and Shopify answer different questions

They are not alternatives. Decide which job you are doing.

**Taking a deposit or retainer when someone books** → **Stripe**. A Payment Link
or Checkout Session. No catalog, no shipping, no inventory. Days of work, and it
fits the business as it exists today.

**Selling bottles that ship to customers** → **Shopify**. Not Stripe, and not a
cart built here. Retail needs tax by jurisdiction, live shipping rates,
inventory, order management, returns, customer accounts, and an admin a
non-technical owner can run. Shopify is all of that on day one; building it in
this codebase is months, and then it is yours to maintain.

If retail happens, start with Shopify's own storefront on `shop.heirloomscents.com`
— days, not months. Go headless (Shopify Storefront API rendered by this Next
app) later, and only if the design mismatch between the two actually bothers
you.

> **The constraint that decides whether retail is viable at all:** alcohol-based
> perfume is a flammable liquid. It ships as a limited quantity / ORM-D ground
> shipment, and most carriers restrict or refuse it by air for consumer parcels.
> This is an operations question, not a platform one, and it needs answering
> before either platform is chosen.

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

- [ ] Decide Calendly vs Cal.com vs keeping the custom calendar
- [ ] Create the account; connect the owner's real Google/Outlook calendar
- [ ] Set the event type: 30 minutes, video or phone, the artboard's four
      occasions as a required question
- [ ] Set brand colour `#b68235` and the closest available font
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

Then, assuming Shopify:

- [ ] Shopify store; catalogue from the eight house scents
- [ ] Shipping profiles reflecting the flammable-liquid restrictions
- [ ] Tax registration for the nexus states
- [ ] Order and fulfilment workflow the owner can run
- [ ] Returns policy, published
- [ ] Decide storefront vs headless; if headless, port the design to the
      Storefront API
- [ ] Link it from the nav — the one change this site needs either way

---

## Ongoing

- [ ] Watch video bandwidth and image-optimization usage on the hobby plan
- [ ] Keep `announcement.notice` in `src/content/site.ts` current — it names a
      season and a year, and is the one string that goes stale on a calendar
- [ ] Exclude this folder from whatever syncs `~/Desktop`. It has duplicated
      files into the working tree and once into `.git`, where it broke `git`
      outright
