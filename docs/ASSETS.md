# Assets

## Status

|                                          | Count                     |
| ---------------------------------------- | ------------------------- |
| Real, extracted from the design project  | **3** (the brand emblems) |
| Dimension-accurate placeholders          | **20**                    |
| Total in `src/content/image-manifest.ts` | 23                        |

Run `npm run audit:assets` for the current inventory.

## Why 20 are placeholders

The Claude Design MCP's `get_file` caps responses at **256 KiB and truncates**
beyond that. Every source photograph exceeds the cap, so each came back as
partial, undecodable base64. The three emblems are under the cap and were
extracted intact.

Real pixel dimensions **were** recovered — PNG `IHDR` and JPEG `SOF` headers sit
in the first bytes and survived truncation. Placeholders are therefore generated
at the exact source dimensions, in each scent's own overlay tint. Layout,
aspect ratios, and CLS behaviour are all correct; only the photographic content
is standing in.

## Replacing a placeholder

1. Export the original from the Claude Design project.
2. Overwrite the file in place, keeping the **same filename and dimensions**.
3. Run `npm run images:manifest` to regenerate the manifest.
4. Run `npm test` — a unit test asserts every manifest entry exists on disk with
   non-zero dimensions.

No code change is required. Nothing references an image except by manifest key.

## Files to replace

```
public/images/scents/
  bg-scents-hero.png              1260 × 1231
  bottle-berry-cloud.png          1024 × 572
  bottle-citrus-rose.png          1024 × 572
  bottle-golden-vanilla.png       1024 × 572
  bottle-ivory-petals.png         1024 × 572
  bottle-lychee-rose.png          1024 × 572
  bottle-midnight-vanilla.png     1024 × 572
  bottle-saffron-amber.jpeg       1024 × 572
  bottle-velvet-coffee.png        1024 × 572

public/images/photos/
  photo-artist-pour.png           1197 × 1204
  photo-bottle-hand.png           1008 × 889
  photo-cart-curtain.png          1134 × 1491
  photo-cart-hero.png             1134 × 1272
  photo-closeup-tray.png          1109 × 1245
  photo-hero-bg.png               1260 × 1231
  photo-setup-blue.png            1159 × 1286
  photo-setup-sage.png            1159 × 1176
  photo-step1-choose.png          1109 × 999
  photo-step2-blend.png            983 × 1094
  photo-step3-bottles.png         1159 × 1108
```

`public/images/brand/hs-emblem-{burgundy,cream,gold}.png` are the real files —
do not replace them.

## Placeholder content

Two pieces of copy are stubbed in the artboards themselves and ship as marked
placeholders:

| Where                           | Current value                        | Source note                                            |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `ABOUT_COPY.founderAttribution` | "Founder name & bio to come"         | The artboard reads exactly this.                       |
| Founder portrait                | Reuses `photo-closeup-tray`          | The artboard's slot is empty.                          |
| `SITE.email` / `SITE.hostEmail` | `hello@` / `host@heirloomscents.com` | The artboard notes "Email & phone stubs — to confirm". |

All live in `src/content/` — each is a one-line edit.
