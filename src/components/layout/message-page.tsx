import { Mark } from "@/components/primitives";
import { cn } from "@/lib/cn";

/** The shared shell for /not-found and the error boundary. */
export function MessagePage({
  heading,
  body,
  children,
}: {
  readonly heading: string;
  readonly body: string;
  readonly children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-narrow flex-col items-center justify-center px-6 py-24 text-center desk:px-14">
      <Mark height={48} />
      <h1 className="mt-8 font-heading text-display-xs leading-[1.08] font-normal">{heading}</h1>
      <p className="mt-4 text-body-md/[1.8] text-ink/70">{body}</p>
      {children}
    </div>
  );
}

/** The row of actions under a message page's copy. */
export function ActionRow({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
}) {
  return (
    <div className={cn("mt-10 flex flex-wrap items-center justify-center gap-6", className)}>
      {children}
    </div>
  );
}
