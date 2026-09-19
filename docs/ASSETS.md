# Assets

Every asset is the real thing. There are no placeholders.

| Group                   | Count | Source                                            |
| ----------------------- | ----- | ------------------------------------------------- |
| `public/images/brand/`  | 7     | `hs-mark.png` + the six `brand-*.jpg` photographs |
| `public/images/scents/` | 9     | the `bottle-*` files and `bg-scents-hero.png`     |
| `public/images/photos/` | 6     | the `photo-*` studio renders                      |
| `public/video/`         | 4 + 4 | `reel-1…4.mp4` and a poster frame for each        |

`src/content/media-manifest.ts` is generated from these by
`npm run media:manifest`, which records every file's real pixel dimensions so
each `next/image` and `<video>` gets explicit `width` and `height` and the site
ships zero layout shift. Nothing references an asset except by manifest key.

## The audit

`npm run audit:assets` fails the build in **both** directions:

- a file in the manifest with no file on disk (posters included), and
- a file on disk that no component references.

It runs inside `npm run verify`, so the redesign cannot strand an asset and a
component cannot point at one that was deleted.

## Adding or replacing an asset

1. Drop the file into the right `public/images/<group>/` or `public/video/`.
   A video needs a poster beside it, named `<name>-poster.jpg`.
2. `npm run media:manifest`
3. Reference it by its new key. `npm test` asserts every manifest entry exists
   on disk with non-zero dimensions.

No other code change is needed.

## Video

The four reels are 576 × 1024 (9:16), H.264, 30fps, 19–47s, each with an AAC
track. They were re-encoded from the design project's originals at CRF 28 with
64 kbit mono audio, which took the set from **17 MB to 9.9 MB** with dimensions,
duration and audio intact.

There is no `next/image` equivalent for video, so weight is managed by hand:

- Poster frames are extracted at 1s, so the still matches the first frame and
  the swap into playback is invisible.
- `BackgroundVideo` never sets `autoPlay`. It starts playback from an effect,
  pauses when the reel leaves the viewport, and holds the poster under
  `prefers-reduced-motion`.
- The four films on `/events` carry `preload="none"`, so the page does not fetch
  9.9 MB on paint.

## Provenance

The source project is `~/Desktop/Business Docs/Heirloom Scents/Heirloom Scents
website redesign/`. Of the 32 files in its `assets/`, 27 are referenced by an
artboard and imported here. `docs/DESIGN-PARITY.md` lists the five groups that
are not, and why.

The six `brand-*.jpg` photographs and the four reels are the studio's own
material; their identity was confirmed by matching md5 against the project's
`uploads/` rather than by eye.
