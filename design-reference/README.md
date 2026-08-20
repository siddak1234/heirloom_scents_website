# design-reference

Provenance for the Claude Design import.

- **Project** `0c4ed435-1fea-4231-b2f2-a1c0a0df68bf` — "Heirloom Scents website redesign"
- **Design system** `classical`
- **Imported** 2026-08-20

`asset-report.json` records every asset pulled from the project: its real pixel
dimensions, and whether the bytes arrived intact or were truncated by the design
MCP's 256 KiB response cap. `scripts/generate-placeholders.mjs` and
`npm run audit:assets` both read it.

## Why the artboards are not copied here

The plan originally called for the six `.dc.html` files to live here as a diffing
reference. They are not, deliberately:

- They cannot be rendered locally. They depend on the Claude Design preview
  runtime (`support.js`, `<x-dc>`, `<sc-for>`, `{{ }}`), which is not distributed.
  A copy could not be diffed against, only read.
- Keeping the design values in two places is exactly the duplication the token
  layer exists to remove. `src/styles/globals.css` **is** the port of the `classical`
  stylesheet, and `src/content/` **is** the port of the copy.

Every intentional difference from the artboards is recorded in
`docs/DESIGN-PARITY.md`. The artboards themselves remain the source of truth and
live in the Claude Design project.
