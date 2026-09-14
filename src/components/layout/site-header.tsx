"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/primitives";
import { BOOKING, NAV_ITEMS } from "@/content/navigation";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";

const LINK = "text-label-sm tracking-link whitespace-nowrap uppercase no-underline";

/**
 * The three-column sticky nav: links left, wordmark centred, booking CTA right.
 *
 * The artboards give the current page no link — it renders as a `<span>` with
 * an accent underline. That needs the pathname, which is why this is the one
 * client component in the layout shell.
 *
 * There is no drawer. Below 861px the artboards wrap the whole bar into centred
 * rows, which is the design's own answer to small screens; a hamburger would be
 * invention. See docs/DESIGN-PARITY.md.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-60 border-b border-divider bg-bg",
        "flex flex-wrap items-center justify-center gap-[14px] px-6 py-4",
        "desk:grid desk:grid-cols-[1fr_auto_1fr] desk:gap-4.5 desk:px-8",
      )}
    >
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-center gap-[14px] gap-y-1.5 desk:justify-start desk:gap-[13px]"
      >
        {NAV_ITEMS.map((item) =>
          isActive(item.href) ? (
            <span
              key={item.href}
              aria-current="page"
              className={cn(LINK, "border-b border-accent pb-1 text-accent-700")}
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(LINK, "text-ink hover:text-accent-800")}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <Link
        href="/"
        aria-label={`${SITE.name} — home`}
        className="flex items-center gap-3.5 text-ink no-underline desk:justify-self-center"
      >
        <Mark height={34} priority />
        <span className="font-heading text-body-lg font-semibold tracking-brand whitespace-nowrap uppercase">
          {SITE.name}
        </span>
      </Link>

      <div className="flex desk:justify-end">
        {isActive(BOOKING.href) ? (
          <span
            aria-current="page"
            className={cn(
              LINK,
              "border border-accent px-5 py-[11px] text-label-lg tracking-nav text-accent-700",
            )}
          >
            {BOOKING.label}
          </span>
        ) : (
          <Link
            href={BOOKING.href}
            className={cn(
              LINK,
              "border border-accent px-4 py-2.5 text-label-lg tracking-nav text-ink",
              "transition-colors duration-350 hover:bg-accent/12",
            )}
          >
            {BOOKING.label}
          </Link>
        )}
      </div>
    </header>
  );
}
