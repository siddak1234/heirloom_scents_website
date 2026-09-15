# Deployment

A standard Next.js 16 app on Vercel with no custom build configuration. Every
route is statically prerendered; there are no route handlers and no server
secrets.

```bash
npm install
npm run verify   # typecheck → lint → format → unit → audits → build
npm run dev
```

## Vercel

1. Import the repository. Vercel detects Next.js; leave build and output
   settings at their defaults. Turbopack is the default bundler in Next 16.
2. Node 20.9 or later (the app declares `engines.node >= 20.9`).
3. Set the environment variables below.

## Environment variables

| Variable                   | Scope  | Environments        | Notes                                                                                                                                                                                                                               |
| -------------------------- | ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CALENDLY_URL` | Public | Production, Preview | The consultation booking link, e.g. `https://calendly.com/heirloomscents/consultation`. Without it `/booking` renders an honest "being set up" panel pointing at Instagram rather than a form that takes a booking nobody receives. |
| `NEXT_PUBLIC_SITE_URL`     | Public | Production, Preview | Canonical origin. Falls back to the value in `src/content/site.ts`.                                                                                                                                                                 |

Both are public by definition — a scheduling link and a canonical URL. **The
project holds no secrets.** `scripts/audit-bundle.mjs` keeps it that way: it
fails the build if a client chunk references a known secret env var name or
contains anything shaped like a live credential.

## Content Security Policy

`src/proxy.ts` sets a strict policy: `default-src 'self'`, no `'unsafe-eval'`
in production, `frame-ancestors 'none'`, `object-src 'none'`.

**The Calendly embed needs three exceptions, and gets exactly three.** They are
added only when `NEXT_PUBLIC_CALENDLY_URL` is set, so an unconfigured deploy
keeps the tighter policy:

| Directive    | Added                         | For                                 |
| ------------ | ----------------------------- | ----------------------------------- |
| `script-src` | `https://assets.calendly.com` | the loader, `widget.js`             |
| `style-src`  | `https://assets.calendly.com` | `widget.css`, which is not optional |
| `frame-src`  | `https://calendly.com`        | the iframe the loader injects       |

`connect-src` stays `'self'` and `default-src` stays `'self'`. **No
`'unsafe-eval'`** — Calendly's community threads claim the embed requires it;
the served `widget.js` contains no `eval(` and no `new Function(`, and the embed
was verified working without it. The scheduling app runs inside the iframe under
Calendly's own policy, not ours.

`frame-src` governs what we may embed; `frame-ancestors 'none'` governs who may
embed us, and is unchanged.

`tests/e2e/booking.spec.ts` asserts all of this. It is the check that matters:
the embed's markup renders whether or not the policy admits the script, so a
test that only looks for the container passes while the widget is dead.

### A pre-existing violation, and why it is harmless

Every page reports one blocked `eval` from a Next.js chunk. It is **Zod 4**
probing for `eval` so it can JIT-compile validators:

```js
try {
  return (Function(""), true);
} catch {
  return false;
}
```

The probe is wrapped in `try`/`catch`, so a blocked `eval` returns false and Zod
falls back to its interpreted path. There are no uncaught errors on any route.
The only cost is marginally slower validation. Do not add `'unsafe-eval'` to
silence it.

## Booking

Scheduling is **Calendly**, on its free plan, embedded inline in the booking
page's right column. The artboard's aside is unchanged.

### Why it is not ours

The site previously shipped a hand-built calendar, slot picker and availability
layer. It had no connection to anyone's real calendar, so it would accept a
3:00 PM consultation that was already committed elsewhere — and nothing in the
codebase could know otherwise without integrating Google or Outlook, which is
most of what a scheduling product is. Reminders, reschedule, cancellation,
timezone and DST correctness and the meeting link all come with the scheduler.

That removed roughly 1,370 lines and five dependencies, along with the Supabase,
Resend and Turnstile integrations the old flow was waiting on. None of them was
ever wired, and none is needed now.

### Setting it up

1. Calendly account, free plan.
2. **Connect the owner's real Google or Outlook calendar.** This is the point of
   the exercise — it is what makes double-booking impossible.
3. One event type: 30 minutes, "Heirloom Scents consultation".
4. Attach Google Meet or Microsoft Teams. Video conferencing is free on every
   Calendly plan, so each booking gets its own link.
5. Add the occasion question — wedding, graduation, other — to the booking form.
6. Brand colour `#b68235`.
7. Copy the event link into `NEXT_PUBLIC_CALENDLY_URL` in Vercel and redeploy.

Reminders are a paid feature and are not configured. The consultation lands on
the owner's calendar, which is where a reminder would come from anyway. No
payment is taken: the consultation is free.

### What happens on a booking

Calendly writes the event straight into the connected calendar with the meeting
link attached, and emails both the guest and the owner. There is no webhook to
receive and nothing in this codebase runs.

## Commerce

Not built yet. `docs/ROADMAP.md` Phase 3 covers it: Shopify Basic as the engine,
the storefront rendered by this app through the Storefront API, and checkout
handed off to Shopify's hosted checkout. On Basic the checkout cannot live on
our own domain — a custom checkout domain is Plus only — and that trade is
accepted.

When it lands, the Shopify Storefront API token is public by design (it is
scoped to read published products) and belongs in `NEXT_PUBLIC_`. An **Admin**
API token is not, and must never reach the client; the bundle audit already
denylists its name and value shape.
