import Image from "next/image";
import { image, type ImageKey } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

/**
 * Slow alternating scale on a full-bleed backdrop image — scale(1) to
 * scale(1.08), which is the redesign's own keyframe.
 *
 * The animation is set inline because the duration varies per instance and
 * Tailwind cannot extract a class built from a template literal. Reduced motion
 * is still covered: the global block in globals.css uses `!important`, which
 * outranks an inline style.
 */
export function KenBurns({
  src,
  className,
  opacity,
  objectPosition,
  priority = true,
  durationSeconds = 24,
}: {
  readonly src: ImageKey;
  readonly className?: string | undefined;
  readonly opacity?: number | undefined;
  readonly objectPosition?: string | undefined;
  readonly priority?: boolean;
  readonly durationSeconds?: number;
}) {
  const asset = image(src);
  return (
    <Image
      src={asset.src}
      alt=""
      aria-hidden="true"
      fill
      priority={priority}
      sizes="100vw"
      className={cn("object-cover", className)}
      style={{
        ...(opacity === undefined ? {} : { opacity }),
        ...(objectPosition === undefined ? {} : { objectPosition }),
        animationName: "hs-ken-burns",
        animationDuration: `${String(durationSeconds)}s`,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
      }}
    />
  );
}
