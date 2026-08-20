import Image from "next/image";
import { Emblem } from "@/components/primitives";
import { Eyebrow } from "@/components/primitives";
import { image, type ImageKey } from "@/content/image-manifest";
import { cn } from "@/lib/cn";

/** The full-bleed photo band with a burgundy wash and an italic display line. */
export function PhotoInterlude({
  src,
  heading,
  eyebrow,
  showEmblem = false,
  objectPosition = "center 30%",
  className,
}: {
  readonly src: ImageKey;
  readonly heading: string;
  readonly eyebrow?: string | undefined;
  readonly showEmblem?: boolean;
  readonly objectPosition?: string;
  readonly className?: string | undefined;
}) {
  const asset = image(src);
  return (
    <section className={cn("relative h-[400px] overflow-hidden md:h-[440px]", className)}>
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(color-mix(in srgb, var(--color-burgundy-deep) 55%, transparent), color-mix(in srgb, var(--color-burgundy-deep) 72%, transparent))",
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-cream">
        {showEmblem ? <Emblem tone="cream" height={36} className="mb-5 opacity-90" /> : null}
        {eyebrow ? <Eyebrow tone="on-dark">{eyebrow}</Eyebrow> : null}
        <p className="mt-[18px] max-w-[640px] font-heading text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.2] font-normal italic">
          {heading}
        </p>
      </div>
    </section>
  );
}
