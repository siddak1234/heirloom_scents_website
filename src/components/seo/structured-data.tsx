import { image } from "@/content/media-manifest";
import { EVENT_TYPES } from "@/content/pages";
import { SITE } from "@/content/site";

/**
 * LocalBusiness + Service structured data, rendered once from the root layout.
 * Serialised via JSON.stringify so a stray character in the copy cannot break
 * the payload.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${SITE.url}/#business`,
        name: SITE.name,
        description: SITE.description,
        url: SITE.url,
        email: SITE.email,
        slogan: SITE.tagline,
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.locality,
          addressRegion: SITE.region,
          addressCountry: "US",
        },
        areaServed: SITE.serviceArea,
        image: `${SITE.url}${image("hs-mark").src}`,
      },
      ...EVENT_TYPES.map((event) => ({
        "@type": "Service",
        "@id": `${SITE.url}/events#${event.slug}`,
        name: `${event.name} fragrance bar`,
        description: event.body,
        provider: { "@id": `${SITE.url}/#business` },
        areaServed: SITE.serviceArea,
      })),
    ],
  };

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(data)}
    </script>
  );
}
