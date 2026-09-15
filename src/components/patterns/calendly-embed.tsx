"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { SITE } from "@/content/site";

/*
 * Both `assets.calendly.com` and `calendly.com` serve these byte-identically
 * (verified: 11,933 and 2,461 bytes). The assets host is the CDN, and it is the
 * single origin the CSP has to allow for the loader.
 *
 * The stylesheet is not optional — without it the widget renders unstyled and
 * the spinner never resolves visually.
 */
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

/**
 * Calendly's inline embed, filling the booking page's right column.
 *
 * The URL comes from `NEXT_PUBLIC_CALENDLY_URL` rather than the content layer
 * so it can be set in Vercel without a deploy, and so a fork or a preview can
 * point at a different scheduling link. When it is unset the page says so and
 * gives a route that works, instead of rendering an empty box — see
 * `bookingFallback` below.
 *
 * Calendly's widget script is loaded `lazyOnload`: it is third-party, it is not
 * needed for first paint, and the aside beside it carries the page's meaning.
 */
export function CalendlyEmbed({ url }: { readonly url: string }) {
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  // The widget hydrates whatever `.calendly-inline-widget` nodes exist when the
  // script runs. On a client navigation the script is already cached and does
  // not re-run, so nudge it once the node is in the DOM.
  useEffect(() => {
    mounted.current = true;
    if (!ready) return;
    const w = window as unknown as {
      Calendly?: { initInlineWidgets?: () => void };
    };
    w.Calendly?.initInlineWidgets?.();
  }, [ready]);

  return (
    <>
      {/* React 19 hoists and dedupes this into <head>. */}
      <link rel="stylesheet" href={WIDGET_CSS} />
      <div
        className="calendly-inline-widget min-h-[760px] w-full"
        data-url={url}
        /* Calendly reads these off the node; they are its API, not styling. */
        data-resize="true"
        aria-label={`Book a consultation with ${SITE.name}`}
      />
      <Script
        src={WIDGET_JS}
        strategy="lazyOnload"
        onLoad={() => {
          setReady(true);
        }}
      />
    </>
  );
}
