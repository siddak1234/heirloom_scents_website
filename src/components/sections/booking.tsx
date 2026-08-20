"use client";

import { useState } from "react";
import { DarkBand, SiteFooterBooking } from "@/components/layout";
import { Emblem, Eyebrow, NumberMark } from "@/components/primitives";
import { BookingForm } from "@/features/booking/components/booking-form";
import { Confirmation } from "@/features/booking/components/confirmation";
import type { BookingResult } from "@/features/booking/schema";
import { BOOKING_COPY } from "@/content/pages";
import { SITE } from "@/content/site";
import Image from "next/image";
import { image } from "@/content/image-manifest";

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
      <div className="grid lg:min-h-[calc(100vh-var(--nav-h))] lg:grid-cols-[minmax(360px,42%)_1fr]">
        <DarkBand as="aside" className="flex flex-col justify-between">
          <Image
            src={aside.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-burgundy-lift) 55%, transparent), color-mix(in srgb, var(--color-burgundy-deep) 95%, transparent))",
            }}
          />
          <div className="relative px-6 pt-14 md:px-14 md:pt-16">
            <Emblem tone="cream" height={56} className="opacity-95" />
            <p className="mt-7 font-heading text-[clamp(2rem,5vw,var(--text-display-xs))] leading-[1.06] font-normal text-cream">
              {BOOKING_COPY.asideHeading[0]}
              <br />
              {BOOKING_COPY.asideHeading[1]}
            </p>
            <p className="mt-5 max-w-[380px] text-body/[1.85] text-cream-80">
              {BOOKING_COPY.asideBlurb}
            </p>
          </div>
          <div className="relative px-6 pt-10 pb-14 md:px-14 md:pb-14">
            <ol className="flex max-w-[320px] flex-col">
              {BOOKING_COPY.asideSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 border-t border-cream-15 py-[13px]"
                >
                  <NumberMark variant="inline">{String(i + 1)}</NumberMark>
                  <span className="text-body-sm text-cream-80">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-body-xs text-cream-60">
              Prefer email?{" "}
              <a href={`mailto:${SITE.email}`} className="text-accent hover:text-accent-300">
                {SITE.email}
              </a>
            </p>
          </div>
        </DarkBand>

        <div className="flex max-w-[680px] flex-col justify-center px-6 py-14 md:px-18 md:py-16">
          <Eyebrow>{BOOKING_COPY.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-heading text-[clamp(2rem,5.5vw,var(--text-title-lg))] leading-[1.06] font-normal">
            {BOOKING_COPY.formHeading}
          </h1>
          <div className="mt-9">
            <BookingForm onBooked={setResult} />
          </div>
        </div>
      </div>
      <SiteFooterBooking />
    </>
  );
}
