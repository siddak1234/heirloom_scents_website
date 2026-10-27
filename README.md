# Heirloom Scents

Marketing site and booking flow for Heirloom Scents — a luxury fragrance bar for
weddings, celebrations and everything worth remembering.

Built from the Claude Design project `Heirloom Scents website redesign`
(`classical` design system), ported to Next.js 16.

## Stack

Next.js 16 (App Router, Turbopack) · React 19.2 with the React Compiler ·
TypeScript 6 · Tailwind CSS v4 · react-hook-form + Zod 4 ·
@daypicker/react · Vitest · Playwright + axe

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The site runs with no environment variables. Live booking needs one,
`CALENDLY_TOKEN` — without it `/booking` says online booking is unavailable and
points to Instagram. See [Deployment](docs/DEPLOYMENT.md).

## Scripts

| Script                            | Does                                                                       |
| --------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`                     | Development server                                                         |
| `npm run build`                   | Production build                                                           |
| `npm run verify`                  | typecheck → lint → format → unit → audits → build → bundle audit           |
| `npm test`                        | Unit tests                                                                 |
| `npm run e2e`                     | Playwright across four viewports                                           |
| `npm run audit:tokens`            | Fails if a raw colour appears outside the token layer                      |
| `npm run audit:reuse`             | Fails if a class string is duplicated across files                         |
| `npm run audit:bundle`            | Fails if server-only code reaches a client chunk                           |
| `npm run audit:assets`            | Fails if an asset is stranded on disk or missing from disk                 |
| `npm run knip`                    | Unused files, exports and dependencies                                     |
| `npm run media:manifest`          | Regenerates the media manifest after adding or replacing an asset          |
| `npm run preview <url> <out.png>` | Screenshots a route; reports overflow, invisible elements, failed requests |

## Routes

| Route         | Artboard                                                         |
| ------------- | ---------------------------------------------------------------- |
| `/`           | Home                                                             |
| `/scents`     | Notes — full-viewport snap deck, anchors `#golds` and `#florals` |
| `/experience` | Experience                                                       |
| `/events`     | Events                                                           |
| `/about`      | About                                                            |
| `/booking`    | Booking — form, live Calendly calendar, confirmation             |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — layers, tokens, how booking reaches Calendly
- [Deployment](docs/DEPLOYMENT.md) — Vercel setup and every environment variable
- [Design parity](docs/DESIGN-PARITY.md) — every intentional deviation, with reasons
- [Assets](docs/ASSETS.md) — which imagery is real and how to replace the rest
- [Revamp plan](docs/REVAMP-PLAN.md) — the contract this redesign was ported to
- [Roadmap](docs/ROADMAP.md) — what is left to build, phased, and the decisions each phase needs

## Status

The site is complete and deployable. Booking runs on Calendly's free plan: the
calendar shows Calendly's live open times, and Reserve opens Calendly's window
with the guest's answers already filled in. Calendly writes the event to the
owner's calendar and emails both sides; this app stores nothing.

See [Deployment](docs/DEPLOYMENT.md) for the Calendly setup.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) and the
[Code of Conduct](.github/CODE_OF_CONDUCT.md).
