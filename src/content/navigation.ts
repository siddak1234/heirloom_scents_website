export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** The five nav destinations, in artboard order. */
export const NAV_ITEMS = [
  { href: "/scents", label: "The Scents" },
  { href: "/experience", label: "The Experience" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
] as const satisfies readonly NavItem[];

export const BOOKING = { href: "/booking", label: "Book an Event" } as const satisfies NavItem;

/** Home's centred footer carries the full set; the split footers carry a subset. */
export const FOOTER_FULL = [
  { href: "/", label: "Home" },
  ...NAV_ITEMS,
  BOOKING,
] as const satisfies readonly NavItem[];

export const FOOTER_COMPACT = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];

export const FOOTER_EVENTS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];

export const FOOTER_ABOUT = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Booking" },
] as const satisfies readonly NavItem[];
