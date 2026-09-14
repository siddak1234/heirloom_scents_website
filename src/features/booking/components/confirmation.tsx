import { ArrowLink, Mark } from "@/components/primitives";
import { BOOKING_COPY } from "@/content/pages";
import { SITE } from "@/content/site";
import { formatWhen } from "../lib/format";
import type { BookingResult } from "../schema";

export function Confirmation({
  result,
  onReset,
}: {
  readonly result: BookingResult;
  readonly onReset: () => void;
}) {
  const rows: readonly { label: string; value: React.ReactNode }[] = [
    { label: "What", value: `${SITE.name} consultation — ${result.occasion}` },
    { label: "When", value: <span className="tnum">{formatWhen(result.date, result.slot)}</span> },
    {
      label: "Guests",
      value: (
        <span className="flex flex-col gap-1">
          <span>{result.email}</span>
          <span>{`${SITE.hostEmail} — your Heirloom host`}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-narrow px-6 pt-24 pb-30 text-center desk:px-14">
      <Mark height={64} className="mx-auto" />
      <h1 className="mt-8 font-heading text-title-lg leading-[1.08] font-normal desk:text-display-md">
        {BOOKING_COPY.confirmHeading}
      </h1>
      <p className="mx-auto mt-4.5 max-w-[440px] text-body-md/[1.8] text-ink/70">
        {`Thank you, ${result.name}. Two calendar invites have just been sent — one to you, one to your Heirloom host.`}
      </p>

      <div className="mt-12 border border-divider bg-surface/60 text-left">
        <div className="flex items-center justify-between bg-night px-6 py-[14px] text-cream">
          <span className="text-label-md tracking-nav uppercase">{BOOKING_COPY.inviteHeader}</span>
          <span className="text-label-md tracking-tight-meta text-accent">
            {BOOKING_COPY.inviteAttachment}
          </span>
        </div>
        <dl className="flex flex-col px-6 py-7">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[80px_1fr] gap-4 py-3 desk:grid-cols-[96px_1fr] ${
                i < rows.length - 1 ? "border-b border-divider" : ""
              }`}
            >
              <dt className="text-label-md tracking-link text-accent-700 uppercase">{row.label}</dt>
              <dd className="text-body-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-5 text-caption text-ink/65">{BOOKING_COPY.confirmNote}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-7">
        <ArrowLink href="/" showArrow={false}>
          {BOOKING_COPY.backHome}
        </ArrowLink>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer border-0 bg-transparent pb-1.5 font-body text-label-xl tracking-button text-ink/65 uppercase transition-colors hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {BOOKING_COPY.bookAnother}
        </button>
      </div>
    </div>
  );
}
