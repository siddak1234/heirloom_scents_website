import { NextResponse } from "next/server";
import { z } from "zod";
import { closedDatesForMonth, isMonthInRange } from "@/features/booking/lib/availability";
import { getAvailabilityStore } from "@/features/booking/lib/store";
import { availabilityResponseSchema } from "@/features/booking/schema";
import { parseISO } from "date-fns";

const querySchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ month: url.searchParams.get("month") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Expected ?month=YYYY-MM" }, { status: 400 });
  }

  const { month } = parsed.data;
  if (!isMonthInRange(parseISO(`${month}-01`))) {
    return NextResponse.json({ error: "Month is outside the bookable window" }, { status: 400 });
  }

  const store = getAvailabilityStore();
  const takenSlots = await store.takenSlotsForMonth(month);
  const body = availabilityResponseSchema.parse({
    month,
    closedDates: closedDatesForMonth(month, takenSlots),
    takenSlots,
  });

  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
