export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/**
 * The five nav destinations, in artboard order. Home joins the set in the
 * redesign — the wordmark is no longer the only way back.
 *
 * The artboard file for the scent library is `Notes.dc.html`, but its own nav
 * labels the page "Scents" and its heading reads "Our Scents". The route is
 * unchanged.
 */
export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/experience", label: "Experience" },
  { href: "/scents", label: "Scents" },
  { href: "/about", label: "About" },
] as const satisfies readonly NavItem[];

export const BOOKING = { href: "/booking", label: "Book an Event" } as const satisfies NavItem;

/** Home's three-column footer carries the whole site in one column. */
export const FOOTER_QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/scents", label: "Scents" },
  { href: "/experience", label: "Experience" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  BOOKING,
] as const satisfies readonly NavItem[];

/* The split footers carry a per-page subset, and call the destination
   "Booking" rather than "Book an Event". */

/** About and Events. */
export const FOOTER_MINIMAL = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];

/** Experience. */
export const FOOTER_EXPERIENCE = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];

/** The scent library's footer, nested inside its final slide. */
export const FOOTER_SCENTS = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];
