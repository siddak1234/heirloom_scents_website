import { Emblem } from "@/components/primitives";
import { cn } from "@/lib/cn";

/**
 * The centred single-message layout shared by 404 and the error boundary.
 * Exists so those two pages cannot drift apart.
 */
export function MessagePage({
  title,
  body,
  children,
  showEmblem = false,
  className,
}: {
  readonly title: string;
  readonly body: string;
  readonly children?: React.ReactNode;
  readonly showEmblem?: boolean;
  readonly className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-narrow flex-col items-center px-6 py-28 text-center",
        className,
      )}
    >
      {showEmblem ? <Emblem tone="burgundy" height={56} className="mb-8" /> : null}
      <h1 className="font-heading text-[clamp(1.75rem,5.5vw,var(--text-display-xs))] font-normal">
        {title}
      </h1>
      <p className="mt-4 max-w-[420px] text-body-md/[1.8] text-ink-70">{body}</p>
      {children ? <ActionRow className="mt-9">{children}</ActionRow> : null}
    </div>
  );
}

/** A centred row of actions. Also used by the burgundy CTA band. */
export function ActionRow({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
}) {
  return <div className={cn("flex flex-wrap justify-center gap-5", className)}>{children}</div>;
}
