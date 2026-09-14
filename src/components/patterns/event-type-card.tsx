import { ArrowLink, Plate } from "@/components/primitives";
import { Reveal } from "@/components/motion";
import { EVENTS_COPY } from "@/content/pages";
import type { EventType } from "@/content/pages";

/** One of the four event-type cards on /events. */
export function EventTypeCard({ event }: { readonly event: EventType }) {
  return (
    <Reveal>
      <article className="flex flex-col gap-4.5">
        <Plate
          src={event.image}
          alt={event.imageAlt}
          ratio="4/5"
          sizes="(max-width: 860px) 100vw, 45vw"
          liftOnHover
        />
        <div className="flex items-baseline justify-between gap-4 border-t border-divider pt-4.5">
          <h2 className="font-heading text-heading-lg font-normal">{event.name}</h2>
          <ArrowLink href="/booking" size="sm" className="border-b-0 pb-0">
            {EVENTS_COPY.typeCardLink}
          </ArrowLink>
        </div>
        <p className="text-body-sm/[1.8] text-ink/70 desk:text-justify">{event.body}</p>
      </article>
    </Reveal>
  );
}
