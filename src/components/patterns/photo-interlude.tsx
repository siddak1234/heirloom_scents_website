import Image from "next/image";
import { Mark } from "@/components/primitives";
import { image, type ImageKey } from "@/content/media-manifest";

/**
 * The full-bleed photo band on /experience: 400px tall, 320px below `desk`,
 * under a night wash, carrying the mark and one italic display line.
 */
export function PhotoInterlude({
  src,
  heading,
  objectPosition = "center 40%",
}: {
  readonly src: ImageKey;
  readonly heading: string;
  readonly objectPosition?: string;
}) {
  const asset = image(src);
  return (
    <section className="relative h-[320px] overflow-hidden desk:h-[400px]">
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-night/50 to-night/68" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-cream">
        <Mark height={36} className="opacity-90" />
        <p className="mt-5 max-w-[620px] font-heading text-title-md leading-[1.25] font-normal italic">
          {heading}
        </p>
      </div>
    </section>
  );
}
