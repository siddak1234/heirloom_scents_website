import type { FeatureColumn } from "./home";
import type { ImageKey, VideoKey } from "./media-manifest";

/* ── /experience ─────────────────────────────────────────────────────────── */

export interface ExperienceStep {
  readonly no: number;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly image: ImageKey;
  readonly imageAlt: string;
  /** Only Step One carries a link in the artboard. */
  readonly link?: { readonly href: string; readonly label: string };
}

export const EXPERIENCE_STEPS: readonly ExperienceStep[] = [
  {
    no: 1,
    eyebrow: "Step One",
    title: "Choose your favorite fragrances",
    body: "Guests smell their way down the tower, each house scent poured over a labeled glass. No wrong answers: they simply mark the two or three they keep returning to.",
    image: "photo-step1-choose",
    imageAlt: "Choosing fragrances at the cart",
    link: { href: "/scents", label: "Meet our signature scents" },
  },
  {
    no: 2,
    eyebrow: "Step Two",
    title: "Blend your custom perfume",
    body: "A perfume specialist stays with your guests throughout the event, guiding each pour as they balance their chosen scents, testing on the skin and adjusting until the fragrance feels like their own.",
    image: "photo-closeup-tray",
    imageAlt: "A guest blending at the cart",
  },
  {
    no: 3,
    eyebrow: "Step Three",
    title: "Take home your creation",
    body: "The finished blend is bottled, capped in gold and labeled by hand. Long after the flowers are gone, one spray returns your guests to the evening itself.",
    image: "photo-step3-bottles",
    imageAlt: "Finished keepsake bottles",
  },
];

export const INCLUDED: readonly FeatureColumn[] = [
  {
    title: "The cart, styled to your event",
    body: "Linens, florals and ribbon matched to your palette.",
  },
  {
    title: "A perfume specialist at the bar",
    body: "Guiding every guest from first smell to final pour.",
  },
  {
    title: "Keepsake bottles, labeled by hand",
    body: "Gold‑capped and named for your date.",
  },
  {
    title: "The full menu of house scents",
    body: "Made in‑house in Dallas, never resold.",
  },
];

export const EXPERIENCE_COPY = {
  eyebrow: "The Heirloom Experience",
  heading: "Your guests become the perfumer.",
  blurb:
    "The Heirloom cart arrives styled to your event. A perfume specialist welcomes each guest and guides them as they compose a fragrance of their own from our house scent library, then it leaves poured, labeled and boxed to take home.",
  interludeHeading: "Made by their hands. Worn for years.",
  includedEyebrow: "Every booking includes",
  ctaHeading: "Give your guests something to keep.",
} as const;

/* ── /events ─────────────────────────────────────────────────────────────── */

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
    image: "brand-cart",
    imageAlt: "A wedding setup",
  },
  {
    slug: "bridal-showers",
    name: "Bridal Showers",
    body: "An activity and a favor in one. The bar becomes the afternoon’s centerpiece, ribboned to the shower’s palette, unhurried, and photographed constantly.",
    image: "brand-tower",
    imageAlt: "A bridal shower setup",
  },
  {
    slug: "private-events",
    name: "Private Events",
    body: "Birthdays, anniversaries, dinner parties. For intimate gatherings the experience slows down, longer at the bar, deeper into the library, a blend for every chapter of the story.",
    image: "brand-glasses",
    imageAlt: "A private event setup",
  },
  {
    slug: "brand-experiences",
    name: "Brand Experiences",
    body: "Launches, markets and client appreciation. Guests leave carrying your event in a bottle, and the bar draws a line all night. Custom labeling available.",
    image: "brand-lamp-row",
    imageAlt: "A brand activation",
  },
];

/** The four films in the events grid, in artboard order. */
export const REELS: readonly VideoKey[] = ["reel-1", "reel-2", "reel-3", "reel-4"];

export const EVENTS_COPY = {
  eyebrow: "Events",
  heading: "A luxury perfume bar for your event.",
  heroCta: "Book Your Event",
  heroVideo: "reel-4",
  celebrateEyebrow: "Elegance",
  celebrateHeading: "Celebrate with scent.",
  celebrateBody:
    "Heirloom brings the luxury of fragrance to your event with our mobile perfume bar. Guests enjoy a hands on experience as a perfume specialist guides them through our house scent library to craft a fragrance of their own. Each bottle is poured, personalized and ready to take home as a one of a kind gift. With custom labels, gift bags and cart signage, Heirloom adds a personal and elegant touch to weddings, showers, corporate events and more.",
  celebrateCta: "Book Now",
  typeCardLink: "Book this",
  filmEyebrow: "The Bar, In Motion",
  filmHint: "Tap any film to watch with sound",
  ctaHeading: "Tell us about yours.",
} as const;

/* ── /about ──────────────────────────────────────────────────────────────── */

export const ABOUT_COPY = {
  heading: "A Dallas house of memory.",
  body1:
    "Heirloom Scents began with a simple observation: of everything a guest carries home from a wedding, scent is the only thing that carries them back. We compose our own fragrances, a house library that keeps growing, made in our Dallas studio, never resold from another vendor’s shelf, and we bring them to celebrations on a cart built for lingering.",
  body2:
    "The name is the promise. An heirloom is something made once, kept long, and passed on with a story attached. Every bottle that leaves our bar is exactly that, a memory, bottled.",
  founderEyebrow: "The Founder",
  founderQuote:
    "I wanted guests to leave holding something they made, not something they were handed.",
  /** Stubbed in the artboard. See docs/REVAMP-PLAN.md §9. */
  founderAttribution: "Founder name & bio to come",
  /*
   * The artboard's middle column was "Write to us / hello@heirloomscents.com",
   * under its own note reading "Email & phone stubs, to confirm". That mailbox
   * does not exist, so the column carries the contact route that does — the
   * booking form. The shape the artboard draws is kept; only the dead address
   * is replaced.
   */
  contactColumns: [
    { label: "Find us", value: "Dallas, Texas", note: "Serving Dallas–Fort Worth & beyond" },
    {
      label: "Talk to us",
      value: "Book a consultation",
      note: "Thirty minutes, video or phone",
      href: "/booking",
    },
    { label: "Follow along", value: "@heirloomscents", note: "Recent celebrations, weekly" },
  ] as readonly {
    readonly label: string;
    readonly value: string;
    readonly note: string;
    readonly href?: string;
  }[],
} as const;

/* ── /scents ─────────────────────────────────────────────────────────────── */

export const SCENTS_COPY = {
  eyebrow: "The Scent Library",
  heading: "Our Scents",
  blurb:
    "Our signature fragrances, composed in our Dallas studio and poured at the cart. The library runs deeper, and every blend your guests create begins here.",
  scrollCue: "Scroll to meet them",
  closeHeading: "Reading is one thing. Smelling is another.",
  closeBlurb:
    "Every scent here travels with the cart, along with the rest of the library and anything we compose for you.",
  closeCta: "Book an Event",
  pairedWith: "Best paired with",
} as const;

/* ── /booking ────────────────────────────────────────────────────────────── */

export const BOOKING_COPY = {
  eyebrow: "Booking",
  asideHeading: ["One conversation.", "Then the cart is yours."],
  asideBlurb: "Thirty minutes, video or phone. The details can wait for the call.",
  asideSteps: ["Invite sent instantly", "We plan it on the call", "Proposal within two days"],
  formHeading: "Reserve your consultation.",
  submitLabel: "Reserve",
  submitOpening: "Opening…",
  disclaimer:
    "No commitment — the consultation is complimentary. You confirm in a Calendly window, and the invite goes to you and your Heirloom host.",
  /** Shown once the Calendly window is open, until the booking is confirmed there. */
  finishInCalendly:
    "Almost there — choose “Schedule Event” in the Calendly window to confirm. Closed it by mistake? Press Reserve again.",
  calendarNote: "Greyed days are fully booked or closed.",
  calendarLoading: "Checking availability…",
  monthEmpty: "No openings this month — try the next one.",
  loadError: "We couldn’t load open times.",
  retry: "Try again",
  timeLabel: "Time",
  timeHintEmpty: "pick a day first",
  timePlaceholder: "Open times for the day you pick appear here.",
  timeGone: "That time was just taken. Please pick another.",
  widgetError: "We couldn’t open the booking window. Check your connection and try again.",
  /*
   * Shown when the scheduler cannot be reached at all — no token configured,
   * or Calendly refusing it. A calendar that cannot book is worse than an
   * honest message with a route that works.
   */
  unconfigured:
    "Online booking is briefly unavailable. Message us and we’ll find a time for your consultation.",
  confirmHeading: "Your consultation is scheduled.",
  confirmNote: "Need a different time? Use the reschedule link in your Calendly email.",
  inviteHeader: "Calendar invite sent",
  inviteAttachment: "via Calendly",
  /** Stands in for the time when the guest changed it inside Calendly's window. */
  timeInInvite: "As confirmed in your Calendly invite",
  backHome: "Back to home",
  bookAnother: "Book another",
} as const;

/**
 * The last choice opens a free-text field. Calendly receives the occasion as
 * one line of text — "Wedding", or "Other – Graduation" — because its own
 * "Other" option cannot be pre-filled.
 */
export const OCCASION_OTHER = "Other";
export const OCCASIONS = [
  "Wedding",
  "Bridal Shower",
  "Private Event",
  "Brand Experience",
  OCCASION_OTHER,
] as const;
