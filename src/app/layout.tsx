import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { SiteHeader } from "@/components/layout";
import { StructuredData } from "@/components/seo/structured-data";
import { SITE } from "@/content/site";
import { BRAND_HEX } from "@/styles/brand-constants";
import "@/styles/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: BRAND_HEX.bg,
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* data-scroll-behavior: Next 16 no longer overrides scroll-behavior during
       navigation. Without it a nav click smooth-scrolls the whole document and
       fights the mandatory scroll-snap container on /scents. */
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${lora.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-bg focus:px-4 focus:py-2 focus:text-ink focus:outline-2 focus:outline-accent"
        >
          Skip to content
        </a>
        <StructuredData />
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
