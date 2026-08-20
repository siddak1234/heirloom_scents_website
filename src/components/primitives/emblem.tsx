import Image from "next/image";
import { image } from "@/content/image-manifest";
import { cn } from "@/lib/cn";

const SOURCE = {
  burgundy: "hs-emblem-burgundy",
  cream: "hs-emblem-cream",
  gold: "hs-emblem-gold",
} as const;

interface EmblemProps {
  readonly tone: keyof typeof SOURCE;
  /** Rendered height in px; width follows the source aspect ratio. */
  readonly height: number;
  /**
   * Classes for the wrapper, which owns the box. Put responsive height here
   * (e.g. `max-md:h-20`) — never on the image itself.
   */
  readonly className?: string | undefined;
  /** Omit for decorative use, which renders alt="" and hides it from assistive tech. */
  readonly alt?: string | undefined;
  readonly priority?: boolean;
}

/**
 * The Heirloom monogram, in its three tones.
 *
 * The image always carries `h-full w-auto` — both dimensions declared together,
 * which is what next/image requires. Sizing happens on the wrapper, so a
 * responsive height cannot pin one dimension while leaving the other fixed.
 */
export function Emblem({ tone, height, className, alt, priority = false }: EmblemProps) {
  const asset = image(SOURCE[tone]);

  return (
    <span
      /* Height rides a custom property rather than an inline style, so a
         responsive class in `className` (e.g. `lg:h-[38px]`) can still win —
         an inline style would outrank it. */
      className={cn("inline-block h-(--emblem-h) w-auto", className)}
      style={{ "--emblem-h": `${String(height)}px` } as React.CSSProperties}
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
