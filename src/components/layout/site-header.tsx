"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ButtonLink, Emblem } from "@/components/primitives";
import { BOOKING, NAV_ITEMS } from "@/content/navigation";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";

const LINK =
  "text-label-md tracking-nav whitespace-nowrap uppercase transition-colors duration-300";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the drawer when the route changes. Adjusting state during render is
  // React's documented pattern for deriving from a changed prop — an effect here
  // would cause a cascading render, and this also covers back/forward navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    // Lock the page behind the panel.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the panel so a keyboard or screen-reader user lands there.
    panelRef.current?.querySelector("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      // Keep Tab inside the panel while it is open.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>("a, button");
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-60 border-b border-divider bg-bg">
      <nav
        aria-label="Primary"
        className="flex h-(--nav-h-mobile) items-center justify-between gap-8 px-6 lg:h-(--nav-h) lg:px-11"
      >
        <Link
          href="/"
          className="flex items-center gap-4 text-ink no-underline"
          aria-label={`${SITE.name} — home`}
        >
          <Emblem tone="burgundy" height={32} className="lg:h-[38px]" priority />
          <span className="font-heading text-body-lg font-semibold tracking-brand whitespace-nowrap uppercase max-[380px]:hidden">
            {SITE.name}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-[26px] lg:flex">
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
                className={cn(LINK, "text-ink hover:text-accent-600")}
              >
                {item.label}
              </Link>
            ),
          )}
          {isActive(BOOKING.href) ? (
            <span
              aria-current="page"
              className={cn(LINK, "border-b border-accent pb-1 text-accent-700")}
            >
              {BOOKING.label}
            </span>
          ) : (
            <ButtonLink href={BOOKING.href} variant="accent" size="sm">
              {BOOKING.label}
            </ButtonLink>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex size-11 items-center justify-center text-ink lg:hidden"
        >
          {open ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
        </button>
      </nav>

      {/*
        A panel that covers the viewport below the header, rather than one that
        pushes the page down — a pushdown leaves the hero half-visible underneath
        and reads as broken.
      */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-(--nav-h-mobile) bottom-0 z-50 overflow-y-auto border-t border-divider bg-bg px-6 py-10 lg:hidden"
      >
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="border-b border-divider">
              <Link
                href={item.href}
                {...(isActive(item.href) ? { "aria-current": "page" as const } : {})}
                className={cn(
                  LINK,
                  "block py-5",
                  isActive(item.href) ? "text-accent-700" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink href={BOOKING.href} variant="accent" size="md" className="mt-8 w-full">
          {BOOKING.label}
        </ButtonLink>
        <p className="mt-10 text-body-xs text-ink-65">
          {SITE.locality}, {SITE.region} · {SITE.instagram}
        </p>
      </div>
    </header>
  );
}
