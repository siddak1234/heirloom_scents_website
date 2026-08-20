import type { ImageKey } from "./image-manifest";
import type { Step } from "./home";

/** ── /experience ─────────────────────────────────────────────────────────── */

export interface DetailStep extends Step {
  readonly eyebrow: string;
  readonly image: ImageKey;
  readonly imageAlt: string;
  /** Photograph on the left for odd steps, right for even — as in the artboard. */
  readonly imageFirst: boolean;
  readonly link?: { readonly href: string; readonly label: string };
}

export const EXPERIENCE_STEPS: readonly DetailStep[] = [
  {
    no: 1,
    eyebrow: "Step One",
    title: "Choose your favorite fragrances",
    body: "Guests smell their way down the tower — eight house scents, each poured over a labeled glass. No wrong answers: they simply mark the two or three they keep returning to.",
    image: "photo-step1-choose",
    imageAlt: "Choosing fragrances at the cart",
    imageFirst: true,
    link: { href: "/scents", label: "Meet the eight scents" },
  },
  {
    no: 2,
    eyebrow: "Step Two",
    title: "Blend your custom perfume",
    body: "With a blend artist beside them, guests pour and balance their chosen scents drop by drop — testing on the skin, adjusting, until the mixture stops smelling like ours and starts smelling like theirs.",
    image: "photo-closeup-tray",
    imageAlt: "A guest blending at the cart",
    imageFirst: false,
  },
  {
    no: 3,
    eyebrow: "Step Three",
    title: "Take home your creation",
    body: "The finished blend is bottled, capped in gold and labeled by hand. Long after the flowers are gone, one spray returns your guests to the evening itself.",
    image: "photo-step3-bottles",
    imageAlt: "Finished keepsake bottles",
    imageFirst: true,
  },
];

export const INCLUDED: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: "The cart, styled to your event",
    body: "Linens, florals and ribbon matched to your palette.",
  },
  {
    title: "A blend artist at the bar",
    body: "Guiding every guest from first smell to final pour.",
  },
  {
    title: "Keepsake bottles, labeled by hand",
    body: "Gold‑capped and named for your date.",
  },
  {
    title: "The menu of eight house scents",
    body: "Made in‑house in Dallas — never resold.",
  },
];

export const EXPERIENCE_COPY = {
  eyebrow: "The Heirloom Experience",
  heading: "Your guests become the perfumer.",
  blurb:
    "The Heirloom cart arrives styled to your event. At it, each guest composes a fragrance of their own from our eight house scents — guided, hand‑poured, and boxed to take home.",
  interludeHeading: "Made by their hands. Worn for years.",
  includedEyebrow: "Every booking includes",
  ctaHeading: "Give your guests something to keep.",
} as const;

/** ── /events ─────────────────────────────────────────────────────────────── */

export interface EventType {
  readonly slug: string;
  readonly name: string;
  readonly body: string;
  readonly image: ImageKey;
  readonly imageAlt: string;
}

export const EVENT_TYPES: readonly EventType[] = [
  {
    slug: "weddings",
    name: "Weddings",
    body: "A favor your guests will actually keep. Each bottle is labeled with your names and date, so the scent of the evening travels home in every clutch and coat pocket.",
    image: "photo-setup-sage",
    imageAlt: "A wedding setup",
  },
  {
    slug: "bridal-showers",
    name: "Bridal Showers",
    body: "An activity and a favor in one. The bar becomes the afternoon’s centerpiece — ribboned to the shower’s palette, unhurried, and photographed constantly.",
    image: "photo-setup-blue",
    imageAlt: "A bridal shower setup",
  },
  {
    slug: "private-events",
    name: "Private Events",
    body: "Birthdays, anniversaries, dinner parties. For intimate gatherings the experience slows down — longer at the bar, deeper into the library, a blend for every chapter of the story.",
    image: "photo-cart-curtain",
    imageAlt: "A private event setup",
  },
  {
    slug: "brand-experiences",
    name: "Brand Experiences",
    body: "Launches, markets and client appreciation. Guests leave carrying your event in a bottle — and the bar draws a line all night. Custom labeling available.",
    image: "photo-artist-pour",
    imageAlt: "A brand activation",
  },
];

export const EVENTS_COPY = {
  eyebrow: "Events",
  heading: "Made for life’s most celebrated moments.",
  blurb:
    "The cart travels anywhere in the Dallas–Fort Worth area and dresses to the occasion — ribbon, linen and florals in your palette.",
  ctaHeading: "Tell us about yours.",
} as const;

/** ── /about ──────────────────────────────────────────────────────────────── */

export const ABOUT_COPY = {
  heading: "A Dallas house of memory.",
  body1:
    "Heirloom Scents began with a simple observation: of everything a guest carries home from a wedding, scent is the only thing that carries them back. We compose our own fragrances — eight house scents, made in our Dallas studio, never resold from another vendor’s shelf — and we bring them to celebrations on a cart built for lingering.",
  body2:
    "The name is the promise. An heirloom is something made once, kept long, and passed on with a story attached. Every bottle that leaves our bar is exactly that — a memory, bottled.",
  founderEyebrow: "The Founder",
  founderQuote:
    "I wanted guests to leave holding something they made — not something they were handed.",
  /** PLACEHOLDER — the artboard reads "Founder name & bio to come". */
  founderAttribution: "Founder name & bio to come",
  founderPortraitAlt: "Founder portrait",
} as const;

/** ── /booking ────────────────────────────────────────────────────────────── */

export const BOOKING_COPY = {
  eyebrow: "Booking",
  asideHeading: ["One conversation.", "Then the cart is yours."],
  asideBlurb: "Thirty minutes, video or phone. The details can wait for the call.",
  asideSteps: ["Invite sent instantly", "We plan it on the call", "Proposal within two days"],
  formHeading: "Reserve your consultation.",
  disclaimer:
    "No commitment — the consultation is complimentary. A calendar invite goes to you and your Heirloom host.",
  calendarNote: "Greyed days are fully booked or closed.",
  confirmHeading: "Your consultation is scheduled.",
  confirmNote: "Need a different time? Reply to the invite and we’ll move it.",
} as const;

export const OCCASIONS = ["Wedding", "Bridal Shower", "Private Event", "Brand Experience"] as const;
