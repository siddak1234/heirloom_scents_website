import Image from "next/image";
import { Eyebrow, NumberMark, pad2 } from "@/components/primitives";
import { image } from "@/content/image-manifest";
import { scentOverlayGradient, type Scent } from "@/content/scents";

/** One full-viewport scent slide: photograph, side wash, and left-aligned copy. */
export function ScentSlide({ scent }: { readonly scent: Scent }) {
  const asset = image(scent.image);
  return (
    <section
      data-scent-slide
      {...(scent.anchor ? { id: scent.anchor } : {})}
      aria-label={scent.name}
      className="relative flex min-h-[560px] snap-start overflow-hidden text-cream lg:h-full lg:snap-always"
    >
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: scentOverlayGradient(scent),
        }}
      />
      <div className="relative mx-auto grid w-full max-w-wide items-center gap-12 px-6 py-16 md:px-18 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <NumberMark variant="inline">No. {pad2(scent.index)}</NumberMark>
          <h2 className="mt-3 font-heading text-[clamp(2.25rem,7vw,var(--text-display-md))] leading-[1.02] font-normal text-cream">
            {scent.name}
          </h2>
          <Eyebrow size="md" tone="on-dark" className="mt-4">
            {scent.origin}
          </Eyebrow>
          <p className="mt-6 max-w-[480px] text-body-lg/[1.85] text-cream-90">
            {scent.description}
          </p>
          <p className="mt-6 text-label-md tracking-meta text-cream-60 uppercase">
            Best paired with · {scent.pairings.join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}
