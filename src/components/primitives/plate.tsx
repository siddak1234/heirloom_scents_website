import Image from "next/image";
import { image, type ImageKey } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

/**
 * The `.plate` treatment from the classical system: a warm archival grade
 * inside a thin surface-coloured mat, so photographs read as tipped-in book
 * plates. Twenty instances in the artboards; replaces the design's <image-slot>.
 *
 * The frame is separate from the image because the events page mats a video in
 * the same treatment — one declaration of the mat, two kinds of content.
 */
export function PlateFrame({
  ratio,
  className,
  liftOnHover = false,
  children,
}: {
  /** CSS aspect-ratio, e.g. "4/5". Matches the artboard's own ratio per instance. */
  readonly ratio: string;
  readonly className?: string | undefined;
  /** Lifts the whole plate on hover, as on the events and about pages. */
  readonly liftOnHover?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative box-border min-w-0 overflow-hidden",
        "border-6 border-surface outline-1 outline-divider",
        "[filter:sepia(0.22)_saturate(0.82)_contrast(1.05)]",
        liftOnHover &&
          "transition-[transform,box-shadow] duration-900 ease-brand hover:scale-[1.015] hover:shadow-md",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {children}
    </div>
  );
}

interface PlateProps {
  readonly src: ImageKey;
  readonly alt: string;
  readonly ratio: string;
  readonly className?: string | undefined;
  /** Slow scale-up of the photograph inside the mat, as on the experience steps. */
  readonly zoomOnHover?: boolean;
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
  sizes = "(max-width: 860px) 100vw, 50vw",
}: PlateProps) {
  const asset = image(src);
  return (
    <PlateFrame ratio={ratio} className={className} liftOnHover={liftOnHover}>
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
    </PlateFrame>
  );
}
