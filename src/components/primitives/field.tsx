"use client";

import { cn } from "@/lib/cn";

/**
 * The design system's `.input`, ported verbatim: 36px minimum height, 6px/10px
 * padding, 14px type, a divider hairline that warms on hover and turns accent
 * on focus, and an accent caret.
 */
const CONTROL = [
  "w-full min-h-9 px-[10px] py-[6px] font-body text-body",
  "bg-transparent text-ink caret-accent",
  "rounded-md border border-divider",
  "hover:border-ink/45",
  "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
  "aria-[invalid=true]:border-accent-800",
].join(" ");

export function Input({ className, ...props }: React.ComponentPropsWithoutRef<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}
