import { NextResponse } from "next/server";
import { isMonthInReach } from "@/features/booking/lib/calendly";
import {
  CalendlyNotConfiguredError,
  getMonthAvailability,
} from "@/features/booking/lib/calendly-api";
import {
  availabilityResponseSchema,
  MAX_MONTHS_AHEAD,
  monthKeySchema,
} from "@/features/booking/schema";

/*
 * Open consultation times for one month, live from Calendly.
 *
 * Cached at Vercel's edge for a minute per month, so a burst of visitors costs
 * Calendly one request rather than one each. A time booked in that minute can
 * still show here; Calendly's own window refuses it, so it cannot double-book.
 */
const CACHED = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" };
const UNCACHED = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const parsed = monthKeySchema.safeParse(new URL(request.url).searchParams.get("month"));
  if (!parsed.success) {
    return NextResponse.json({ error: "Expected ?month=YYYY-MM" }, { status: 400 });
  }
  const month = parsed.data;
  const now = new Date();
  if (!isMonthInReach(month, now, MAX_MONTHS_AHEAD)) {
    return NextResponse.json({ error: "Month is outside the bookable window" }, { status: 400 });
  }

  try {
    const body = availabilityResponseSchema.parse(await getMonthAvailability(month, now));
    for (const [answer, key] of Object.entries(body.answerKeys)) {
      // Booking still works — the guest types this answer in Calendly instead —
      // but the question name in Calendly no longer matches. docs/DEPLOYMENT.md.
      if (key === null) console.warn(`[booking] Calendly has no "${answer}" question to pre-fill`);
    }
    return NextResponse.json(body, { headers: CACHED });
  } catch (error) {
    if (error instanceof CalendlyNotConfiguredError) {
      return NextResponse.json({ error: "not-configured" }, { status: 503, headers: UNCACHED });
    }
    console.error(
      "[booking] Calendly availability failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "upstream" }, { status: 502, headers: UNCACHED });
  }
}
