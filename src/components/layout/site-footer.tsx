import Link from "next/link";
import { Mark } from "@/components/primitives";
import { FOOTER_QUICK_LINKS, type NavItem } from "@/content/navigation";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Five footers, because the artboards draw five. Each page's shape is its own:
 * Home carries the whole site, the interior pages carry a subset, the scent
 * deck's sits inside its final slide on the dark ground, and Booking trades
 * links for the tagline.
 */

const LINK = "text-label-md tracking-button whitespace-nowrap uppercase no-underline";

function copyright(): string {
  return `© ${String(SITE.copyrightYear)} ${SITE.name}, ${SITE.locality}, ${SITE.region}`;
}

function FooterLinks({ links, onDark = false }: { links: readonly NavItem[]; onDark?: boolean }) {
  return (
    <ul className="flex flex-wrap justify-center gap-8">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={cn(LINK, onDark ? "text-cream hover:text-accent" : "text-ink")}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Home: brand blurb, every destination, and the contact column. */
export function SiteFooterFull() {
  return (
    <footer className="border-t border-divider px-6 pt-16 pb-9 desk:px-14">
      <div className="mx-auto grid max-w-content gap-14 desk:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Mark height={44} alt={SITE.name} />
          <p className="mt-4.5 max-w-[360px] text-caption/[1.8] text-ink/66">
            A mobile perfume bar for weddings, showers, corporate gatherings and celebrations.
            Guests create their own signature scents with a perfume specialist, and every bottle
            leaves personalized.
          </p>
        </div>

        <div>
          <h2 className="text-label-md font-normal tracking-nav text-accent-700 uppercase">
            Quick Links
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {FOOTER_QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-caption text-ink no-underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-label-md font-normal tracking-nav text-accent-700 uppercase">
            Contact
          </h2>
          <address className="mt-4 flex flex-col gap-2.5 text-caption text-ink/74 not-italic">
            <a href={`mailto:${SITE.email}`} className="text-ink/74">
              {SITE.email}
            </a>
            <span>{SITE.instagram}</span>
            <span>
              {SITE.locality}, {SITE.region}
            </span>
          </address>
        </div>
      </div>

      <p className="mx-auto mt-9 max-w-content border-t border-divider pt-5 text-center text-label-lg text-ink/65">
        {`© ${String(SITE.copyrightYear)} ${SITE.name}. All rights reserved. ${SITE.tagline}`}
      </p>
    </footer>
  );
}

/** About and Experience: copyright left, links right. */
export function SiteFooterSplit({ links }: { readonly links: readonly NavItem[] }) {
  return (
    <footer className="mx-auto box-border flex max-w-content flex-col items-center justify-between gap-6 px-6 py-10 desk:flex-row desk:px-14">
      <p className="text-label-lg text-ink/65">{copyright()}</p>
      <FooterLinks links={links} />
    </footer>
  );
}

/** Events: the same split, with the mark held between the two halves. */
export function SiteFooterMarked({ links }: { readonly links: readonly NavItem[] }) {
  return (
    <footer className="mx-auto box-border flex max-w-content flex-wrap items-center justify-between gap-6 px-6 py-10 desk:px-14">
      <p className="text-label-lg text-ink/65">{copyright()}</p>
      <Mark height={30} />
      <FooterLinks links={links} />
    </footer>
  );
}

/** The scent deck: nested inside the closing slide, on the night ground. */
export function SiteFooterOnDark({ links }: { readonly links: readonly NavItem[] }) {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-cream/14 px-6 py-7 desk:flex-row desk:px-14">
      <p className="text-label-lg text-cream/55">{copyright()}</p>
      <FooterLinks links={links} onDark />
    </footer>
  );
}

/** Booking: copyright, mark, tagline. No links — the page is the destination. */
export function SiteFooterBooking() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-divider px-6 py-9 desk:px-14">
      <p className="text-label-lg text-ink/65">{`© ${String(SITE.copyrightYear)} ${SITE.name} — ${SITE.locality}, ${SITE.region}`}</p>
      <Mark height={30} />
      <p className="text-label-lg text-ink/65">{SITE.tagline}</p>
    </footer>
  );
}
