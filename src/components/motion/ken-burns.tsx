import Image from "next/image";
import { image, type ImageKey } from "@/content/image-manifest";
import { cn } from "@/lib/cn";

/** Slow alternating scale on a full-bleed backdrop image. */
export function KenBurns({
  src,
  className,
  opacity,
  objectPosition,
  priority = true,
  durationSeconds = 22,
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
      className={cn(
        "object-cover motion-reduce:animate-none",
        `animate-[hs-ken-burns_${String(durationSeconds)}s_ease-in-out_infinite_alternate]`,
        className,
      )}
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
