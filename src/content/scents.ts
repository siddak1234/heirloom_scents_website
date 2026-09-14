import { z } from "zod";
import { IMAGES, type ImageKey } from "./media-manifest";

const scentSchema = z.object({
  slug: z.string(),
  /** 1-based position; rendered zero-padded as "No. 01". */
  index: z.number().int().min(1).max(8),
  name: z.string(),
  /** The full provenance line on the scent's own slide. */
  origin: z.string(),
  /** The shorter line the home page's rail card carries. */
  shortOrigin: z.string(),
  description: z.string(),
  pairings: z.tuple([z.string(), z.string()]),
  image: z.custom<ImageKey>((v) => typeof v === "string" && v in IMAGES),
  /**
   * Base rgb of that slide's own 90° gradient, which runs
   * 0.86 → 0.62 → 0.10 → 0.22 across the slide. Content, not a token: the stop
   * pattern is shared, the colour belongs to the scent.
   */
  overlay: z.string().regex(/^\d+,\d+,\d+$/),
  /** Deep-link target. Only two slides carry one in the artboard. */
  anchor: z.string().optional(),
});

export type Scent = z.infer<typeof scentSchema>;

export const SCENTS: readonly Scent[] = z
  .array(scentSchema)
  .length(8)
  .parse([
    {
      slug: "saffron-amber",
      index: 1,
      name: "Saffron Amber",
      origin: "Kashmir threads · Mediterranean resin",
      shortOrigin: "Kashmir threads · resin",
      description:
        "Saffron threads laid over sun warmed amber resin. It opens like a spice market at closing time and settles into something golden and calm. The warmest pour on the cart.",
      pairings: ["Midnight Vanilla", "Velvet Coffee"],
      image: "bottle-saffron-amber",
      overlay: "25,10,6",
      anchor: "golds",
    },
    {
      slug: "golden-vanilla",
      index: 2,
      name: "Golden Vanilla",
      origin: "Sava Region, Madagascar",
      shortOrigin: "Sava Region, Madagascar",
      description:
        "Bourbon vanilla cured by hand for months on the Madagascar coast. Warm, radiant and unhurried, like candlelight on linen. Guests reach for it when they want comfort in a bottle.",
      pairings: ["Saffron Amber", "Berry Cloud"],
      image: "bottle-golden-vanilla",
      overlay: "30,18,8",
    },
    {
      slug: "midnight-vanilla",
      index: 3,
      name: "Midnight Vanilla",
      origin: "Réunion Island",
      shortOrigin: "Réunion Island",
      description:
        "Vanilla taken somewhere darker. Smoked and resinous, it belongs to the hours after the toasts, when the music slows. The last song of the reception, worn on the wrist.",
      pairings: ["Velvet Coffee", "Citrus Rose"],
      image: "bottle-midnight-vanilla",
      overlay: "21,18,15",
    },
    {
      slug: "velvet-coffee",
      index: 4,
      name: "Velvet Coffee",
      origin: "Yirgacheffe, Ethiopia",
      shortOrigin: "Yirgacheffe, Ethiopia",
      description:
        "Roasted highland beans softened into something silken. Closer to a Viennese café than a kitchen, it gives a blend depth without weight. The quiet signature under many of our favorite pours.",
      pairings: ["Golden Vanilla", "Midnight Vanilla"],
      image: "bottle-velvet-coffee",
      overlay: "22,12,6",
    },
    {
      slug: "citrus-rose",
      index: 5,
      name: "Citrus Rose",
      origin: "Grasse, France",
      shortOrigin: "Grasse, France",
      description:
        "May rose from the hills of Grasse, brightened with pressed citrus. A morning garden just after the rain. It lifts every blend it touches.",
      pairings: ["Ivory Petals", "Golden Vanilla"],
      image: "bottle-citrus-rose",
      overlay: "24,19,15",
      anchor: "florals",
    },
    {
      slug: "ivory-petals",
      index: 6,
      name: "Ivory Petals",
      origin: "Seville orange blossom",
      shortOrigin: "Seville orange blossom",
      description:
        "White blossom picked while the flowers are still cool. Neroli, jasmine and a breath of gardenia. Our bridal favorite, poured into more wedding bottles than any other.",
      pairings: ["Citrus Rose", "Berry Cloud"],
      image: "bottle-ivory-petals",
      overlay: "28,22,12",
    },
    {
      slug: "berry-cloud",
      index: 7,
      name: "Berry Cloud",
      origin: "Orchard fruit · soft musk",
      shortOrigin: "Orchard fruit · soft musk",
      description:
        "Ripe berries lifted with soft musk until they float. Playful and airy, the pour that makes guests smile before they can say why. It keeps a blend young.",
      pairings: ["Ivory Petals", "Golden Vanilla"],
      image: "bottle-berry-cloud",
      overlay: "24,8,14",
    },
    {
      slug: "lychee-rose",
      index: 8,
      name: "Velvet Lychee Rose",
      origin: "Isparta rose · lychee silk",
      shortOrigin: "Isparta rose · lychee silk",
      description:
        "Damask rose from Isparta wrapped around cool lychee. Lush and a little decadent, velvet as a scent. Choose it when the evening calls for drama.",
      pairings: ["Saffron Amber", "Citrus Rose"],
      image: "bottle-lychee-rose",
      overlay: "24,19,15",
    },
  ]);

/** Every scent's display name, for checking that a pairing names a real scent. */
export const SCENT_NAMES: readonly string[] = SCENTS.map((scent) => scent.name);

/**
 * The slide gradient, built from the scent's own base. The four stops are
 * identical on all eight slides; only the colour changes.
 */
export function slideGradient(overlay: string): string {
  return (
    `linear-gradient(90deg, rgba(${overlay},0.86) 0%, rgba(${overlay},0.62) 40%, ` +
    `rgba(${overlay},0.1) 68%, rgba(${overlay},0.22) 100%)`
  );
}
