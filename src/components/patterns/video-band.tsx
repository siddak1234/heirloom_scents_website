import { DarkBand } from "@/components/layout";
import { BackgroundVideo } from "@/components/primitives";
import type { VideoKey } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

/**
 * A full-bleed reel behind centred copy. Two instances: the home page's
 * "Scents for every guest." band and the events hero. Same structure, different
 * reel, height and veil.
 */
export function VideoBand({
  src,
  opacity,
  veilFrom,
  veilTo,
  className,
  children,
}: {
  readonly src: VideoKey;
  readonly opacity: number;
  /** Veil opacity in percent at the top and bottom of the band. */
  readonly veilFrom: number;
  readonly veilTo: number;
  readonly className?: string | undefined;
  readonly children: React.ReactNode;
}) {
  return (
    <DarkBand as="section" className={cn("overflow-hidden", className)}>
      <BackgroundVideo src={src} opacity={opacity} className="absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            `linear-gradient(color-mix(in srgb, var(--color-veil) ${String(veilFrom)}%, transparent), ` +
            `color-mix(in srgb, var(--color-veil) ${String(veilTo)}%, transparent))`,
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        {children}
      </div>
    </DarkBand>
  );
}
