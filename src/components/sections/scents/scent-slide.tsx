import Image from "next/image";
import { NumberMark, pad2 } from "@/components/primitives";
import { image } from "@/content/media-manifest";
import { SCENTS_COPY } from "@/content/pages";
import { slideGradient, type Scent } from "@/content/scents";

/**
 * One full-viewport scent slide: the bottle photograph full-bleed, the scent's
 * own gradient fading left to right, and the copy in the left column.
 *
 * Below `desk` the slide is at least one screen tall and grows to fit its copy,
 * rather than holding the artboard's fixed height, which clips the description
 * on a phone. See docs/DESIGN-PARITY.md.
 */
export function ScentSlide({
  scent,
  priority = false,
}: {
  readonly scent: Scent;
  readonly priority?: boolean;
}) {
  const asset = image(scent.image);
  const headingId = `scent-${scent.slug}`;
  return (
    <section
      {...(scent.anchor ? { id: scent.anchor } : {})}
      data-scent-slide=""
      aria-labelledby={headingId}
      className="relative deck-pane snap-start snap-always overflow-hidden text-cream desk:h-[calc(100vh-var(--nav-h))] desk:min-h-0"
    >
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0" style={{ background: slideGradient(scent.overlay) }} />

      <div className="relative mx-auto grid h-full max-w-wide items-center gap-12 px-6 py-20 desk:grid-cols-[1.1fr_1fr] desk:px-18 desk:py-0">
        <div>
          <NumberMark variant="inline">No.&nbsp;{pad2(scent.index)}</NumberMark>
          <h2
            id={headingId}
            className="mt-3.5 font-heading text-title-lg leading-[1.02] font-normal text-cream desk:text-display-xl"
          >
            {scent.name}
          </h2>
          <p className="mt-4 text-label-md tracking-eyebrow text-accent uppercase">
            {scent.origin}
          </p>
          <p className="mt-6 max-w-[480px] text-body-lg/[1.85] text-cream/90">
            {scent.description}
          </p>
          <p className="mt-6.5 text-label-lg tracking-meta text-cream/62 uppercase">
            {`${SCENTS_COPY.pairedWith} · ${scent.pairings[0]} · ${scent.pairings[1]}`}
          </p>
        </div>
      </div>
    </section>
  );
}
