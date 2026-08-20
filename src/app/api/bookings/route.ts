import { NextResponse } from "next/server";
import { z } from "zod";
import { parseISO } from "date-fns";
import { isStructurallyClosed } from "@/features/booking/lib/availability";
import { getAvailabilityStore, getNotifier } from "@/features/booking/lib/store";
import { bookingRequestSchema, bookingResultSchema } from "@/features/booking/schema";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking", issues: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }
  const booking = parsed.data;

  // Honeypot: a real visitor never fills this. Answer 200 with a plausible body
  // so a bot cannot distinguish rejection from success. `company` is not echoed.
  if (booking.company) {
    const { company: _ignored, ...rest } = booking;
    return NextResponse.json({ ok: true, reference: "HS-IGNORED", ...rest }, { status: 200 });
  }

  // Re-check on the server. The client cannot be trusted about what is bookable.
  if (isStructurallyClosed(parseISO(booking.date))) {
    return NextResponse.json({ error: "That day is not available." }, { status: 409 });
  }

  const store = getAvailabilityStore();
  const taken = await store.takenSlotsForMonth(booking.date.slice(0, 7));
  if (taken[booking.date]?.includes(booking.slot)) {
    return NextResponse.json({ error: "That time was just taken." }, { status: 409 });
  }

  const reserved = await store.reserve({
    date: booking.date,
    slot: booking.slot,
    name: booking.name,
    email: booking.email,
    occasion: booking.occasion,
  });
  if (!reserved.ok) {
    return NextResponse.json({ error: "That time was just taken." }, { status: 409 });
  }

  await getNotifier().sendConsultationEmails({ ...booking, reference: reserved.reference });

  const result = bookingResultSchema.parse({
    ok: true,
    reference: reserved.reference,
    name: booking.name,
    email: booking.email,
    occasion: booking.occasion,
    date: booking.date,
    slot: booking.slot,
  });
  return NextResponse.json(result, { status: 201 });
}
