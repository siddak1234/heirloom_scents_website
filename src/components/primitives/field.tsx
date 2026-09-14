"use client";

import { useId } from "react";
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

interface FieldProps {
  readonly label: string;
  readonly error?: string | undefined;
  readonly children: (ids: { id: string; describedBy: string | undefined }) => React.ReactNode;
  readonly className?: string;
}

/** Label + control + error, wired with matching ids so the error is announced. */
export function Field({ label, error, children, className }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      <label htmlFor={id} className="text-caption-sm tracking-field text-ink/70">
        {label}
      </label>
      {children({ id, describedBy: error ? errorId : undefined })}
      {error ? (
        <p id={errorId} role="alert" className="text-caption-sm text-accent-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.ComponentPropsWithoutRef<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentPropsWithoutRef<"select">) {
  return <select className={cn(CONTROL, "cursor-pointer", className)} {...props} />;
}
