import Link from "next/link";
import { BOOKING } from "@/content/navigation";
import { SITE } from "@/content/site";

/**
 * The dark strip above the nav, identical on all six artboards. It scrolls
 * away — only the nav below it is sticky.
 */
export function AnnouncementBar() {
  const { notice, cta } = SITE.announcement;
  return (
    <div className="bg-night px-6 py-2.5 text-center text-label-md tracking-link text-cream uppercase">
      {notice} <span aria-hidden="true">·</span> {SITE.locality}, {SITE.region}{" "}
      <span aria-hidden="true">·</span>{" "}
      <Link href={BOOKING.href} className="text-accent hover:text-accent">
        {cta}
      </Link>
    </div>
  );
}
