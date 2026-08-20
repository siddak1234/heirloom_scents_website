import Link from "next/link";
import { Emblem } from "@/components/primitives";
import { FOOTER_FULL, type NavItem } from "@/content/navigation";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";

const LINK =
  "text-label-sm tracking-button whitespace-nowrap uppercase no-underline transition-colors duration-300";

function copyright(): string {
  return `© ${String(SITE.copyrightYear)} ${SITE.name} — `;
}

/** Home's centred footer: emblem, full link set, contact row, copyright. */
export function SiteFooterCentered() {
  return (
    <footer className="border-t border-divider px-6 pt-16 pb-10 md:px-14">
      <div className="mx-auto flex max-w-content flex-col items-center gap-7 text-center">
        <Emblem tone="burgundy" height={48} alt={SITE.name} />
        <ul className="flex flex-wrap justify-center gap-7">
          {FOOTER_FULL.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  LINK,
                  item.href === "/booking" ? "text-accent-700" : "text-ink",
                  "hover:text-accent-600",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-6 text-body-xs text-ink-65">
          <span>{SITE.instagram}</span>
          <span className="text-accent">·</span>
          <a href={`mailto:${SITE.email}`} className="text-ink-65 hover:text-accent-600">
            {SITE.email}
          </a>
          <span className="text-accent">·</span>
          <span>
            {SITE.locality}, {SITE.region}
          </span>
        </div>
        <p className="text-label-md text-ink-65">
          {copyright()}
          {SITE.tagline}
        </p>
      </div>
    </footer>
  );
}

/** The split footer on Experience, Events and About: copyright left, links right. */
export function SiteFooterSplit({ links }: { readonly links: readonly NavItem[] }) {
  return (
    <footer className="mx-auto box-border flex max-w-content flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:px-14">
      <p className="text-label-md text-ink-65">
        {copyright()}
        {SITE.locality}, {SITE.region}
      </p>
      <ul className="flex gap-8">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={cn(LINK, "text-ink hover:text-accent-600")}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}

/** The footer that sits inside the final burgundy slide on /scents. */
export function SiteFooterOnDark({ links }: { readonly links: readonly NavItem[] }) {
  return (
    <footer className="flex flex-col items-center gap-4 border-t border-cream-15 px-6 py-7 md:flex-row md:justify-between md:px-14">
      <p className="text-label-md text-cream-60">
        {copyright()}
        {SITE.locality}, {SITE.region}
      </p>
      <ul className="flex gap-8">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={cn(LINK, "text-cream hover:text-accent")}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}

/** The booking page's three-part footer. */
export function SiteFooterBooking() {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-divider px-6 py-9 md:flex-row md:px-14">
      <p className="text-label-md text-ink-65">
        {copyright()}
        {SITE.locality}, {SITE.region}
      </p>
      <Emblem tone="burgundy" height={30} />
      <p className="text-label-md text-ink-65">{SITE.tagline}</p>
    </footer>
  );
}
