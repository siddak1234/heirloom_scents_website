# Assets

Every asset is the real thing. There are no placeholders.

| Group                   | Count | Source                                                          |
| ----------------------- | ----- | --------------------------------------------------------------- |
| `public/images/brand/`  | 9     | `hs-mark.png` + eight `brand-*.jpg` photographs                 |
| `public/images/scents/` | 9     | the `bottle-*` files and `bg-scents-hero.png`                   |
| `public/images/photos/` | 5     | the `photo-*` studio renders                                    |
| `public/video/`         | 5 + 5 | `reel-1…4.mp4`, `reel-bar-pan.mp4`, and a poster frame for each |

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

The four reels are 576 × 1024 (9:16), H.264, 30fps, 20–47s, each with an AAC
track, 11.3 MB together. They are encoded at CRF 28 with 64 kbit mono audio:

```bash
ffmpeg -i source.mov -map 0:v:0 -map 0:a:0 -map_metadata -1 \
  -vf "scale=576:1024:flags=lanczos,fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -crf 28 -profile:v high \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 64k -ac 1 -ar 44100 -movflags +faststart reel-N.mp4
ffmpeg -ss 1 -i reel-N.mp4 -frames:v 1 -q:v 4 reel-N-poster.jpg
```

**iPhone footage is HDR** (10-bit HEVC, BT.2020, HLG). Encoding it straight to
8-bit SDR washes the colour out, and Homebrew's ffmpeg has no `zscale` to tone
map with. Convert it with macOS's own `avconvert` first, which tone maps the way
iOS does and strips location metadata by default:

```bash
avconvert -s source.MOV -p Preset1920x1080 -o source-sdr.mov
```

`reel-2` was made this way on 2026-10-27, from 37 MB of HDR to 2.8 MB.

`reel-bar-pan` — the experience hero — is the exception to the reel encode. It
is only ever a muted background, so it carries **no audio track**, and it fills
a full-width banner, so it is **1080 × 1920** rather than 576 × 1024. Its source
is a 4.7s pan, which would jump back to the start on every loop, so it is played
forward then reversed — a seamless 9.4s loop at 2.1 MB. The two turnaround frames
are trimmed so the loop never holds a frame:

```bash
# fwd.mp4: the SDR source at 30 fps; N = its frame count
ffmpeg -i fwd.mp4 -map_metadata -1 -filter_complex \
  "[0:v]split[f][b];[b]reverse,trim=start_frame=1:end_frame=N-1,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 28 -profile:v high \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart reel-bar-pan.mp4
```

There is no `next/image` equivalent for video, so weight is managed by hand:

- Poster frames are extracted at 1s, so the still matches the first frame and
  the swap into playback is invisible.
- `BackgroundVideo` never sets `autoPlay`. It starts playback from an effect,
  pauses when the reel leaves the viewport, and holds the poster under
  `prefers-reduced-motion`.
- The four films on `/events` carry `preload="none"`, so the page does not fetch
  11 MB on paint.

Photographs are JPEG at quality 82 (mozjpeg, via `sharp`, which drops metadata),
cropped to the ratio of the plate they fill when they have only one home.

**iPhone photos are HEIC**, and `sharp`'s prebuilt binary refuses them
("Number of references in iref box exceeds the security limits"). Convert with
macOS's `sips` first, then crop and encode with `sharp` as above — the `sharp`
step is what removes the photo's GPS location:

```bash
sips -s format png IMG_1234.heic --out source.png
```

## Provenance

The source project is `~/Desktop/Business Docs/Heirloom Scents/Heirloom Scents
website redesign/`. Of the 32 files in its `assets/`, 27 are referenced by an
artboard and imported here. `docs/DESIGN-PARITY.md` lists the five groups that
are not, and why.

The six original `brand-*.jpg` photographs and reels 1, 3 and 4 are the
studio's own material; their identity was confirmed by matching md5 against the
project's `uploads/` rather than by eye.

Added after launch, from the owner directly (2026-10-27):

- `brand-bar-dispensers.jpg` — the white bar with six dispensers, the bottle
  tray and the gold lettering. Cropped 4:5 from the bottom of a 967 × 1627 PNG,
  so the dispensers and the lettering both stay in frame on the Private Events
  card.
- `reel-2.mp4` — an October 2026 event, replacing the original second film.
- `brand-bar-cart.jpg` — the Perfume Bar cart, photographed 2026-10-24, beside
  "Created for unforgettable celebrations." on the home page. Cropped 4:5 from
  the gold arch to the wheels of a 3213 × 5712 HEIC and resized to 1080 wide.
- `reel-bar-pan.mp4` — a pan across the same cart, behind the experience hero.
  It replaced `photo-step2-blend.png`, which nothing else used and was removed.
