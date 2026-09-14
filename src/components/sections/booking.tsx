"use client";

import { useState } from "react";
import Image from "next/image";
import { DarkBand, SiteFooterBooking } from "@/components/layout";
import { Eyebrow, Mark, NumberMark } from "@/components/primitives";
import { BookingForm } from "@/features/booking/components/booking-form";
import { Confirmation } from "@/features/booking/components/confirmation";
import type { BookingResult } from "@/features/booking/schema";
import { image } from "@/content/media-manifest";
import { BOOKING_COPY } from "@/content/pages";

export function BookingScreen() {
  const [result, setResult] = useState<BookingResult | null>(null);
  const aside = image("photo-artist-pour");

  if (result) {
    return (
      <>
        <Confirmation
          result={result}
          onReset={() => {
            setResult(null);
          }}
        />
        <SiteFooterBooking />
      </>
    );
  }

  return (
    <>
      <div className="grid desk:min-h-[calc(100vh-var(--nav-h))] desk:grid-cols-[minmax(360px,42%)_1fr]">
        <DarkBand as="aside" className="flex flex-col justify-between">
          <Image
            src={aside.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 860px) 100vw, 42vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-veil-lift) 55%, transparent), color-mix(in srgb, var(--color-night) 95%, transparent))",
            }}
          />
          <div className="relative px-6 pt-16 desk:px-14">
            <Mark height={56} className="opacity-95" priority />
            <h1 className="mt-7 font-heading text-title-lg leading-[1.06] font-normal text-cream desk:text-display-md">
              {BOOKING_COPY.asideHeading[0]}
              <br />
              {BOOKING_COPY.asideHeading[1]}
            </h1>
            <p className="mt-5 max-w-[380px] text-body/[1.85] text-cream/82">
              {BOOKING_COPY.asideBlurb}
            </p>
          </div>
          <div className="relative px-6 pt-10 pb-14 desk:px-14">
            <ol className="flex max-w-[320px] flex-col">
              {BOOKING_COPY.asideSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 border-t border-cream/18 py-[13px]"
                >
                  <NumberMark variant="inline">{String(i + 1)}</NumberMark>
                  <span className="text-body-xs text-cream/82">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </DarkBand>

        <div className="flex max-w-narrow flex-col justify-center px-6 py-16 desk:px-18 desk:py-16">
          <Eyebrow>{BOOKING_COPY.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-heading text-heading-md leading-[1.06] font-normal desk:text-title-xl">
            {BOOKING_COPY.formHeading}
          </h2>
          <div className="mt-9">
            <BookingForm onBooked={setResult} />
          </div>
        </div>
      </div>
      <SiteFooterBooking />
    </>
  );
}
