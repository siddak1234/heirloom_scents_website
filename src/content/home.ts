import type { ImageKey } from "./image-manifest";

export interface Combination {
  readonly no: number;
  readonly name: string;
  readonly notes: string;
  readonly blurb: string;
  /** Anchor on /scents that this blend's notes live under. */
  readonly anchor: string;
}

/** "Popular combinations" — the 2×2 card grid on the home page. */
export const COMBINATIONS: readonly Combination[] = [
  {
    no: 1,
    name: "The First Dance",
    notes: "Ivory Petals · Citrus Rose · Golden Vanilla",
    blurb: "Our most requested wedding blend — white petals over candlelit vanilla.",
    anchor: "florals",
  },
  {
    no: 2,
    name: "Velvet Hour",
    notes: "Saffron Amber · Midnight Vanilla · Velvet Coffee",
    blurb: "Candlelight, late toasts, the last songs of the night.",
    anchor: "golds",
  },
  {
    no: 3,
    name: "Garden Party",
    notes: "Citrus Rose · Berry Cloud · Ivory Petals",
    blurb: "Bright and effortless — a daytime celebration in a bottle.",
    anchor: "florals",
  },
  {
    no: 4,
    name: "Something Kept",
    notes: "Velvet Lychee Rose · Saffron Amber · Golden Vanilla",
    blurb: "Lush lychee and rose, kept warm in golden amber.",
    anchor: "golds",
  },
];

export interface Step {
  readonly no: number;
  readonly title: string;
  readonly body: string;
}

/** The four-step summary in the home page's Experience block. */
export const HOME_STEPS: readonly Step[] = [
  {
    no: 1,
    title: "Choose your favorite fragrances",
    body: "Guests smell through the eight house scents and mark what they love — and what they don’t.",
  },
  {
    no: 2,
    title: "Blend a custom perfume",
    body: "A blend artist composes trials around their preferences until one feels like theirs.",
  },
  {
    no: 3,
    title: "Bottle & label",
    body: "The final blend is hand‑poured and labeled with their name and your date.",
  },
  {
    no: 4,
    title: "Take the memory home",
    body: "A keepsake that returns them to your event every time it’s worn.",
  },
];

export interface Testimonial {
  readonly quote: string;
  readonly attribution: string;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: "Everyone talked about the perfume bar all night.",
    attribution: "Heirloom Bride, Dallas TX",
  },
  {
    quote: "The cart was the most photographed corner of the evening.",
    attribution: "Private Event Host",
  },
  {
    quote: "Guests still tell us their bottle smells like that night.",
    attribution: "Mother of the Bride",
  },
];

/** The scrolling band under the photo interlude. */
export const MARQUEE_ITEMS: readonly string[] = [
  "Weddings",
  "Bridal Showers",
  "Private Events",
  "Brand Experiences",
  "Dallas, Texas",
];

export interface GalleryItem {
  readonly image: ImageKey;
  readonly alt: string;
}

export const GALLERY: readonly GalleryItem[] = [
  { image: "photo-setup-blue", alt: "A wedding perfume bar" },
  { image: "photo-setup-sage", alt: "Guests blending a scent" },
  { image: "photo-bottle-hand", alt: "A finished keepsake bottle" },
];

export const HOME_COPY = {
  heroLead: "HEIRLOOM",
  heroWordmark: "SCENTS",
  heroBlurb: "A luxury fragrance bar for weddings, celebrations & everything worth remembering.",
  memoryHeading: "Memory, bottled.",
  memoryBody:
    "Heirloom Scents is a private fragrance bar for events. We bring the cart, the glassware and a library of house‑made scents to your celebration; each guest sits with a blend artist, composes a fragrance around their own preferences, and leaves with it bottled, labeled and boxed. Nothing is resold and nothing is off the shelf — every scent is ours, and every bottle is theirs.",
  combinationsEyebrow: "Tried & Treasured",
  combinationsHeading: "Popular combinations",
  combinationsBlurb: "Blends our guests return to, composed from the scent library.",
  interludeEyebrow: "The Heirloom Cart",
  interludeHeading: "Bottled at the bar. Kept for years.",
  eventsHeading: "Your event should have a signature scent.",
  galleryEyebrow: "From Recent Celebrations",
} as const;
