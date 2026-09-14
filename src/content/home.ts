import type { ImageKey, VideoKey } from "./media-manifest";

export interface HeroSlide {
  readonly kicker: string;
  readonly title: string;
  readonly blurb: string;
  readonly cta: string;
  readonly href: string;
  /** The filmstrip's three panels. The outer two are hidden below `desk`. */
  readonly left: ImageKey;
  readonly center: ImageKey;
  readonly right: ImageKey;
}

/** The two-slide hero. Advances every 6.5s, or every 9s after an interaction. */
export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    kicker: "Luxury Perfume Bar",
    title: "Scents that speak to you",
    blurb: "Discover your signature scent with our on site custom fragrance experience.",
    cta: "Book Your Event",
    href: "/booking",
    left: "brand-tower",
    center: "brand-cart",
    right: "brand-glasses",
  },
  {
    kicker: "Custom Party Favors",
    title: "Gifts that wow",
    blurb: "Make every guest feel special with personalized fragrance favors.",
    cta: "See the Experience",
    href: "/experience",
    left: "brand-lamp-row",
    center: "brand-bottles",
    right: "brand-gold-stand",
  },
];

export interface Combination {
  readonly no: number;
  readonly name: string;
  readonly notes: string;
  readonly blurb: string;
}

/** "Popular combinations" — the 2×2 card grid. */
export const COMBINATIONS: readonly Combination[] = [
  {
    no: 1,
    name: "The First Dance",
    notes: "Ivory Petals · Citrus Rose · Golden Vanilla",
    blurb: "Our most requested wedding blend, white petals over candlelit vanilla.",
  },
  {
    no: 2,
    name: "Velvet Hour",
    notes: "Saffron Amber · Midnight Vanilla · Velvet Coffee",
    blurb: "Candlelight, late toasts, the last songs of the night.",
  },
  {
    no: 3,
    name: "Garden Party",
    notes: "Citrus Rose · Berry Cloud · Ivory Petals",
    blurb: "Bright and effortless, a daytime celebration in a bottle.",
  },
  {
    no: 4,
    name: "Something Kept",
    notes: "Velvet Lychee Rose · Saffron Amber · Golden Vanilla",
    blurb: "Lush lychee and rose, kept warm in golden amber.",
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

/** The scrolling band between the combinations and the video. */
export const MARQUEE_ITEMS: readonly string[] = [
  "Book Your Event",
  "Custom Favors",
  "Now Booking",
  "Dallas, Texas",
];

export interface FeatureColumn {
  readonly title: string;
  readonly body: string;
}

export const VALUE_PROPS: readonly FeatureColumn[] = [
  {
    title: "A specialist at the bar",
    body: "Guided scent creation for every guest, from first smell to final pour.",
  },
  {
    title: "Made in our Dallas studio",
    body: "Eight house scents of our own. Nothing resold, nothing off the shelf.",
  },
  {
    title: "Favors, labeled by hand",
    body: "Keepsake bottles personalized with your names and your date.",
  },
];

export const HOME_COPY = {
  scentsEyebrow: "Explore Our",
  scentsHeading: "Scents",
  scentsCta: "Explore All Scents",
  combinationsEyebrow: "Tried & Treasured",
  combinationsHeading: "Popular combinations",
  combinationsLink: "Read these scents",
  videoHeading: "Scents for every guest.",
  videoBlurb: "Custom labeled fragrance gifts, made just for them.",
  videoCta: "See It In Motion",
  aboutEyebrow: "About Us",
  aboutHeading: "We are Heirloom.",
  aboutBody:
    "Heirloom Scents is a private fragrance bar for events. We bring the cart, the glassware and a library of house made scents to your celebration. A perfume specialist guides your guests throughout the event, helping each one customize a fragrance around their own preferences before it leaves bottled, labeled and boxed. Nothing is resold and nothing is off the shelf. Every scent is ours, and every bottle is theirs.",
  aboutCta: "About Us",
  testimonialLabel: "What our guests say",
} as const;

/** The reel behind the home page's video band. */
export const HOME_VIDEO: VideoKey = "reel-3";

export const NEWSLETTER_COPY = {
  heading: "Stay in the scent loop.",
  blurb: "Event news, new house scents and booking windows, once a month.",
  label: "Your email",
  cta: "Subscribe",
} as const;
