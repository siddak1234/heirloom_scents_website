"use client";

import { useState } from "react";
import { Button, Input } from "@/components/primitives";
import { NEWSLETTER_COPY } from "@/content/home";

/**
 * The signup band, on /home and /events. Two call sites, one component.
 *
 * The artboard supplies an input and a Subscribe button and no destination —
 * there is no subscription backend yet (docs/REVAMP-PLAN.md §9). Rather than
 * accept an address and silently discard it, the form validates, then says
 * plainly that the list is not open. That is the one honest option until a
 * provider is wired in.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const value = email.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          setMessage("Enter a valid email address.");
          return;
        }
        setMessage("The list is not open yet — write to us and we’ll add you by hand.");
      }}
      className="mx-auto mt-7 flex max-w-[480px] flex-wrap justify-center gap-3"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {NEWSLETTER_COPY.label}
      </label>
      <Input
        id="newsletter-email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder={NEWSLETTER_COPY.label}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setMessage(null);
        }}
        className="min-w-[220px] flex-1"
      />
      <Button type="submit" variant="primary" size="sm" className="min-h-9 px-[30px] py-0">
        {NEWSLETTER_COPY.cta}
      </Button>
      <p role="status" aria-live="polite" className="w-full text-caption-sm text-ink/65">
        {message}
      </p>
    </form>
  );
}
