import { cn } from "@/lib/cn";

/** The 1180px content column with the artboards' 56px gutter. */
export function Section({
  children,
  className,
  as: As = "section",
  id,
  width = "content",
}: {
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
  readonly as?: "section" | "div" | "header" | "footer";
  readonly id?: string | undefined;
  readonly width?: "content" | "wide" | "prose" | "narrow";
}) {
  const max = {
    content: "max-w-content",
    wide: "max-w-wide",
    prose: "max-w-prose",
    narrow: "max-w-narrow",
  }[width];
  return (
    <As id={id} className={cn("mx-auto w-full px-6 md:px-14", max, className)}>
      {children}
    </As>
  );
}
