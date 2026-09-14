import { NewsletterForm } from "./newsletter-form";
import { NEWSLETTER_COPY } from "@/content/home";

/** The signup band closing /home and /events. */
export function NewsletterBand() {
  return (
    <section className="border-t border-divider px-6 py-20 text-center desk:px-14">
      <h2 className="font-heading text-title-sm font-normal">{NEWSLETTER_COPY.heading}</h2>
      <p className="mt-3 text-body-sm text-ink/65">{NEWSLETTER_COPY.blurb}</p>
      <NewsletterForm />
    </section>
  );
}
