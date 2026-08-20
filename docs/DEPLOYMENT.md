# Deployment

The site is a standard Next.js 16 app and deploys to Vercel with no custom build
configuration. It **builds and runs today with no environment variables set** —
every one below is optional until the booking backend is wired.

```bash
npm install
npm run verify   # typecheck → lint → format → unit → audits → build
npm run dev
```

## Vercel setup

1. Import the repository. Vercel detects Next.js; leave build and output settings
   at their defaults. Turbopack is the default bundler in Next 16 — no flag needed.
2. Set the Node version to 20.9 or later (the app declares `engines.node >= 20.9`).
3. Add the environment variables below.

## Environment variables

**No secret is committed to this repository.** `src/lib/env.ts` validates these at
boot with zod, so a malformed value fails the deploy rather than the first booking.

### Needed now

| Variable               | Scope  | Environments        | Notes                                                                                                           |
| ---------------------- | ------ | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public | Production, Preview | Canonical origin, e.g. `https://heirloomscents.com`. Falls back to the value in `src/content/site.ts` if unset. |

### Needed to turn the booking form into real bookings

Until these are set, `/api/bookings` validates the request, enforces the trading
rules, generates the `.ics`, and logs the two emails to the server console. The
form, the calendar, and the confirmation screen are all fully working.

| Variable                    | Scope      | Environments        | Purpose                                                                        |
| --------------------------- | ---------- | ------------------- | ------------------------------------------------------------------------------ |
| `SUPABASE_URL`              | **Secret** | Production, Preview | Project URL for booking persistence.                                           |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Production, Preview | Server-only key. Never expose to the browser — it bypasses RLS.                |
| `RESEND_API_KEY`            | **Secret** | Production, Preview | Sends the guest and host confirmation emails.                                  |
| `BOOKING_HOST_EMAIL`        | Plain      | Production, Preview | Where host notifications go. Defaults to the address in `src/content/site.ts`. |

### Needed to enable bot protection

| Variable                         | Scope      | Environments        | Purpose                                        |
| -------------------------------- | ---------- | ------------------- | ---------------------------------------------- |
| `TURNSTILE_SECRET_KEY`           | **Secret** | Production, Preview | Cloudflare Turnstile server-side verification. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public     | Production, Preview | Turnstile widget site key.                     |

A honeypot field already ships and needs no configuration.

## Wiring the remaining backends

Everything routes through one seam: **`src/features/booking/lib/store.ts`**. No
other file refers to a concrete backend.

```ts
export function getAvailabilityStore(): AvailabilityStore {
  if (hasBookingBackend) {
    // return new SupabaseAvailability(...)   ← the whole change
  }
  return new StaticAvailability();
}
```

### Supabase

Implement `AvailabilityStore` (`src/features/booking/lib/availability.ts`):

- `takenSlotsForMonth(month)` → `{ "2026-09-15": ["3:00 PM"], … }`
- `reserve({ date, slot, … })` → `{ ok: true, reference }` or `{ ok: false, reason: "taken" }`

Suggested schema:

```sql
create table bookings (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  name        text not null,
  email       text not null,
  occasion    text not null,
  date        date not null,
  slot        text not null,
  created_at  timestamptz not null default now(),
  -- Makes double-booking impossible at the database level rather than in app code.
  unique (date, slot)
);
alter table bookings enable row level security;
-- No public policies: all access is via the service role from the route handler.
```

`reserve` must translate a unique-violation into `{ ok: false, reason: "taken" }`.
The route handler already returns 409 for that case and the form already surfaces it.

### Resend

Implement `Notifier` (`src/features/booking/lib/notify.ts`). The message bodies and
the `.ics` attachment are already built and unit-tested — only the transport is
missing:

```ts
await resend.emails.send({
  from: `Heirloom Scents <${BOOKING_HOST_EMAIL}>`,
  to: details.email,
  subject: "Your Heirloom Scents consultation",
  text: guestEmailText(details),
  attachments: [{ filename: "invite.ics", content: buildConsultationIcs(details) }],
});
```

Verify the sending domain in Resend before going live.

## Known follow-up: calendar timezone

`buildConsultationIcs` emits **floating local time** on purpose. The library's
default converts using the _server's_ clock, so on Vercel (UTC) a 3:00 PM slot
would reach the guest's calendar as 10:00 AM Dallas. Floating time carries the
wall-clock time the guest chose and is host-independent. A unit test guards this.

Once bookings are real, pin the event to `America/Chicago` with a proper
VTIMEZONE block so daylight-saving transitions are unambiguous.
