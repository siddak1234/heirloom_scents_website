import Image from "next/image";
import { image, type ImageKey } from "@/content/image-manifest";
import { cn } from "@/lib/cn";

/**
 * The `.plate` treatment from the classical system: a warm archival grade inside
 * a thin surface-coloured mat, so photographs read as tipped-in book plates.
 * Twelve instances in the artboards; replaces the design's <image-slot>.
 */
interface PlateProps {
  readonly src: ImageKey;
  readonly alt: string;
  /** CSS aspect-ratio, e.g. "4/3". Matches the artboard's own ratio per instance. */
  readonly ratio: string;
  readonly className?: string | undefined;
  /** Slow scale-up of the photograph inside the mat, as on the home page. */
  readonly zoomOnHover?: boolean;
  /** Lifts the whole plate on hover, as on the events and about pages. */
  readonly liftOnHover?: boolean;
  readonly priority?: boolean;
  readonly sizes?: string | undefined;
}

export function Plate({
  src,
  alt,
  ratio,
  className,
  zoomOnHover = false,
  liftOnHover = false,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: PlateProps) {
  const asset = image(src);
  return (
    <div
      className={cn(
        "group box-border min-w-0 overflow-hidden",
        "border-6 border-surface outline-1 outline-divider",
        "[filter:sepia(0.22)_saturate(0.82)_contrast(1.05)]",
        liftOnHover &&
          "transition-[transform,box-shadow] duration-900 ease-brand hover:scale-[1.015] hover:shadow-md",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={asset.src}
        alt={alt}
        width={asset.width}
        height={asset.height}
        priority={priority}
        sizes={sizes}
        className={cn(
          "h-full w-full object-cover",
          zoomOnHover && "transition-transform duration-1400 ease-brand group-hover:scale-105",
        )}
      />
    </div>
  );
}
