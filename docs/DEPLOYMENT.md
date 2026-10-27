# Deployment

The site is a standard Next.js 16 app and deploys to Vercel with no custom build
configuration. Every route is statically prerendered except `/api/availability`,
which reads Calendly at request time.

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

**No secret is committed to this repository.** A change to any of these takes
effect on the next deployment.

| Variable               | Scope      | Environments        | Notes                                                                                                                      |
| ---------------------- | ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `CALENDLY_TOKEN`       | **Secret** | Production, Preview | Calendly personal access token, scopes `users:read` and `event_types:read` only. Mark it **Sensitive**. See Booking below. |
| `CALENDLY_EVENT_SLUG`  | Plain      | Production, Preview | Optional. Only needed if the Calendly account ever has more than one active event type — the slug of the one to book.      |
| `NEXT_PUBLIC_SITE_URL` | Public     | Production, Preview | Canonical origin, e.g. `https://heirloomscents.com`. Falls back to the value in `src/content/site.ts` if unset.            |

`CALENDLY_API_BASE` also exists, for the end-to-end suite only: Playwright points
it at `tests/mocks/calendly-api.mjs`. Never set it in Vercel.

Without `CALENDLY_TOKEN` the site still builds and runs; `/booking` shows an
honest "online booking is briefly unavailable" panel with an Instagram link
instead of a calendar that cannot book.

`scripts/audit-bundle.mjs` fails the build if `CALENDLY_TOKEN`, or any code that
calls `api.calendly.com`, reaches a client chunk.

## Booking

Scheduling is **Calendly, on its free plan**, behind the site's own form.

```
Browser                          This server                    Calendly
───────                          ───────────                    ────────
calendar, times ── GET ──> /api/availability ── token ──> REST API (read-only)
Reserve ── opens ─────────────────────────────────────> booking window (iframe)
confirmation <── postMessage "event_scheduled" ─────────┘
```

- **Availability is live.** `/api/availability?month=YYYY-MM` asks Calendly for
  the event type's open times (two requests per month — Calendly allows 31 days
  per request) and returns them with the consultation length and the pre-fill
  map. Vercel's edge caches each month for 60 seconds.
- **The booking itself is Calendly's.** Creating a booking through Calendly's API
  needs a paid plan. On the free plan, Reserve opens Calendly's own window at the
  chosen time with name, email, phone, occasion and notes already filled in; the
  guest clicks **Schedule Event** there. Calendly then writes the event to the
  connected calendar with the meeting link and emails both sides.
- **Nothing is stored here.** There is no database, no webhook and no email
  provider. Calendly is the record of every booking.

A time booked in the 60 seconds the edge holds a month can still show on the
calendar. Calendly's window refuses it, so it cannot double-book.

### Setting up Calendly

1. **Connect the real calendar** — Settings → Scheduling → Calendars. This is
   what stops a consultation landing on a time that is already committed.
2. **One event type** — Scheduling → Event types. Free allows one active event
   type; edit the one Calendly created rather than adding a second.
   - Name "Heirloom Scents consultation", 30 minutes
   - Location: Google Meet, Zoom or Teams, so each booking gets its own link
   - Time zone: Central
3. **Availability** — days, hours, minimum notice and how far ahead guests may
   book are all read live. Whatever Calendly offers is what the calendar shows;
   nothing about the schedule is hard-coded in this site. Discrete windows
   (10:00–10:30, 12:30–1:00 …) produce exactly those times.
4. **Booking questions**, matched **by name** (case and punctuation ignored), so
   their order does not matter:

   | Name                            | Type           | Required |
   | ------------------------------- | -------------- | -------- |
   | `Phone number`                  | Phone number   | Yes      |
   | `Occasion`                      | One line       | Yes      |
   | `Anything else we should know?` | Multiple lines | No       |

   Occasion is deliberately plain text: Calendly cannot pre-fill the typed text
   of its own "Other" option, so the site sends "Wedding" or "Other – Graduation".
   Leave Calendly's text-reminder phone field off — it cannot be pre-filled.

5. **Token** — Automations → Integrations & apps → API & Webhooks → Get a token
   now. Scopes `users:read` and `event_types:read`, nothing else: that token can
   read the schedule and cannot book, cancel or change anything. Copy it into
   `CALENDLY_TOKEN` in Vercel as Sensitive.

### When something is wrong

Every failure logs one line in the project's **Logs** tab, prefixed `[booking]`.
The token never appears in a log.

| What the guest sees                     | Log                                                     | Cause and fix                                                                                                               |
| --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| "Online booking is briefly unavailable" | none — the route answers 503                            | `CALENDLY_TOKEN` is not set in this environment. Set it and redeploy.                                                       |
| "We couldn’t load open times"           | `Calendly /users/me → 401 …`                            | The token was revoked or mistyped. Make a new one.                                                                          |
| "We couldn’t load open times"           | `… → 403 … insufficient scope`                          | The token is missing `users:read` or `event_types:read`.                                                                    |
| "We couldn’t load open times"           | `Calendly has 2 active event types (…)`                 | Deactivate the extra one, or set `CALENDLY_EVENT_SLUG`.                                                                     |
| A field is blank in Calendly's window   | `… has no question for: phone. Its questions: …` (WARN) | A question is missing or renamed; the log lists the names Calendly has. Match them to the table above. Booking still works. |
| Every day greyed                        | none                                                    | Calendly has no open times in that month — check availability, date range and that the calendar is not all busy.            |

## Testing it for real

On a preview deployment, with the token set for Preview:

1. Book a consultation with your own details. The calendar's open times should
   match Calendly's own booking page.
2. Calendly's window opens at the chosen time with every answer already filled
   in — **check the phone number arrived in the right format**.
3. Confirm. The event lands on the connected calendar with a meeting link, both
   emails arrive, and phone, occasion and notes appear on the booking in Calendly.
4. Reload within a minute or two: the booked time is gone from the calendar.
5. Cancel the test booking in Calendly.
