import { Section } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { ArrowLink, ButtonLink, Eyebrow, Plate } from "@/components/primitives";
import type { ImageKey } from "@/content/media-manifest";
import { cn } from "@/lib/cn";

/**
 * The two-column story block: a matted photograph beside an eyebrow, a 48px
 * heading, a justified paragraph and one action. Home's "We are Heirloom." and
 * the events page's "Celebrate with scent." are the same block mirrored.
 */
export function StorySplit({
  eyebrow,
  heading,
  body,
  cta,
  href,
  ctaStyle,
  image,
  imageAlt,
  imageFirst = false,
  className,
}: {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: string;
  readonly href: string;
  /** The artboards use an underlined link on home and an outlined button on events. */
  readonly ctaStyle: "link" | "button";
  readonly image: ImageKey;
  readonly imageAlt: string;
  readonly imageFirst?: boolean;
  readonly className?: string | undefined;
}) {
  const plate = (
    <Reveal>
      <Plate src={image} alt={imageAlt} ratio="4/5" sizes="(max-width: 860px) 100vw, 45vw" />
    </Reveal>
  );

  const copy = (
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-heading text-display-sm leading-[1.08] font-normal">{heading}</h2>
      <p className="mt-5.5 text-body-md/[1.9] text-ink/78 desk:text-justify">{body}</p>
      {ctaStyle === "link" ? (
        <ArrowLink href={href} className="mt-6.5">
          {cta}
        </ArrowLink>
      ) : (
        <ButtonLink href={href} variant="accent" size="sm" className="mt-7">
          {cta}
        </ButtonLink>
      )}
    </Reveal>
  );

  return (
    <Section
      className={cn(
        "grid items-center gap-18 py-25",
        imageFirst ? "desk:grid-cols-[1fr_1.1fr]" : "desk:grid-cols-[1.1fr_1fr]",
        className,
      )}
    >
      {imageFirst ? plate : copy}
      {imageFirst ? copy : plate}
    </Section>
  );
}
