import type { FeatureColumn } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * The rule-topped column set: home's three value props and the experience
 * page's four "every booking includes" items. Same shape, different count and
 * title size, which is the whole difference between the two instances.
 */
export function FeatureColumns({
  items,
  columns,
  className,
}: {
  readonly items: readonly FeatureColumn[];
  readonly columns: 3 | 4;
  readonly className?: string | undefined;
}) {
  return (
    <ul
      className={cn(
        "grid gap-10",
        columns === 3 ? "desk:grid-cols-3" : "desk:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.title} className="border-t border-divider pt-5">
          <h3
            className={cn(
              "font-heading font-semibold",
              columns === 3 ? "text-subtitle-lg" : "text-subtitle-md",
            )}
          >
            {item.title}
          </h3>
          <p className="mt-2 text-caption/[1.7] text-ink/64">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
