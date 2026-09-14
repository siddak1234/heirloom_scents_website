import Image from "next/image";
import { image } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

interface MarkProps {
  /** Rendered height in px; width follows the source aspect ratio. */
  readonly height: number;
  /**
   * Classes for the wrapper, which owns the box. Put a responsive height here
   * — never on the image itself.
   */
  readonly className?: string | undefined;
  /** Omit for decorative use, which renders alt="" and hides it from assistive tech. */
  readonly alt?: string | undefined;
  readonly priority?: boolean;
  /** About's story block crops the mark to a circle. Square by definition. */
  readonly circle?: boolean;
}

/**
 * The Heirloom monogram. Seventeen instances across the six artboards, at
 * heights 30, 34, 36, 40, 44, 56, 64 and 76 — one asset, one component.
 *
 * The image always carries `h-full w-auto`, both dimensions declared together,
 * which is what next/image requires. Sizing happens on the wrapper, so a
 * responsive height cannot pin one dimension while leaving the other fixed.
 */
export function Mark({ height, className, alt, priority = false, circle = false }: MarkProps) {
  const asset = image("hs-mark");

  if (circle) {
    return (
      <Image
        src={asset.src}
        alt={alt ?? ""}
        width={height}
        height={height}
        priority={priority}
        className={cn("rounded-full object-cover shadow-sm", className)}
      />
    );
  }

  return (
    <span
      /* Height rides a custom property rather than an inline style, so a
         responsive class in `className` can still win — an inline style
         would outrank it. */
      className={cn("inline-block h-(--mark-h) w-auto", className)}
      style={{ "--mark-h": `${String(height)}px` } as React.CSSProperties}
    >
      <Image
        src={asset.src}
        alt={alt ?? ""}
        /* Intrinsic dimensions, not the rendered ones. CSS scales both together,
           which is what keeps next/image quiet: deriving a rounded width here
           would leave it a fraction of a pixel off the rendered width, and
           next/image reads that as "width modified, height not". */
        width={asset.width}
        height={asset.height}
        priority={priority}
        className="h-full w-auto"
      />
    </span>
  );
}
