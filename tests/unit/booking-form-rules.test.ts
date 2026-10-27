import { describe, expect, it } from "vitest";
import { toE164 } from "@/features/booking/lib/phone";
import { calendlyPrefill, groupByLocalDay, occasionAnswer } from "@/features/booking/lib/schedule";
import { bookingFormSchema, type BookingFormValues } from "@/features/booking/schema";

const valid: BookingFormValues = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "(214) 555-0123",
  occasion: "Wedding",
  occasionOther: "",
  notes: "",
  date: "2026-10-30",
  start: "2026-10-30T20:00:00.000Z",
};

const errorPaths = (values: BookingFormValues) => {
  const result = bookingFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
};

describe("toE164", () => {
  it.each([
    ["(214) 555-0123", "+12145550123"],
    ["214.555.0123", "+12145550123"],
    ["1 214 555 0123", "+12145550123"],
    ["+44 20 7946 0958", "+442079460958"],
  ])("reads %s as %s", (raw, expected) => {
    expect(toE164(raw)).toBe(expected);
  });

  it.each(["555-0123", "2145550123 ext 4", "+12", "call me"])("refuses %s", (raw) => {
    expect(toE164(raw)).toBeNull();
  });
});

describe("bookingFormSchema", () => {
  it("accepts a complete booking", () => {
    expect(errorPaths(valid)).toEqual([]);
  });

  it("requires a dialable phone number", () => {
    expect(errorPaths({ ...valid, phone: "" })).toEqual(["phone"]);
    expect(errorPaths({ ...valid, phone: "555" })).toEqual(["phone"]);
  });

  it('requires the occasion to be named when it is "Other"', () => {
    expect(errorPaths({ ...valid, occasion: "Other", occasionOther: "  " })).toEqual([
      "occasionOther",
    ]);
    expect(errorPaths({ ...valid, occasion: "Other", occasionOther: "Graduation" })).toEqual([]);
  });

  it('reports "Other" alongside other missing answers, not after them', () => {
    // Every field empty, as on a first press of Reserve — the empty phone in
    // particular once stopped this refinement from running at all.
    const empty = { ...valid, name: "", email: "", phone: "", date: "", start: "" };
    expect(errorPaths({ ...empty, occasion: "Other", occasionOther: "" })).toEqual(
      expect.arrayContaining(["name", "email", "phone", "start", "occasionOther"]),
    );
  });

  it("caps the notes", () => {
    expect(errorPaths({ ...valid, notes: "x".repeat(1001) })).toEqual(["notes"]);
  });
});

describe("occasionAnswer", () => {
  it("passes a listed occasion through", () => {
    expect(occasionAnswer(valid)).toBe("Wedding");
  });

  it('labels a typed one as "Other"', () => {
    expect(occasionAnswer({ occasion: "Other", occasionOther: " Graduation " })).toBe(
      "Other – Graduation",
    );
  });
});

describe("calendlyPrefill", () => {
  const keys = { phone: "a1", occasion: "a2", notes: "a3" };

  it("puts each answer in its Calendly slot, phone in E.164", () => {
    expect(calendlyPrefill({ ...valid, notes: " About 120 guests. " }, keys)).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      customAnswers: { a1: "+12145550123", a2: "Wedding", a3: "About 120 guests." },
    });
  });

  it("leaves the notes out when there are none and nothing to carry", () => {
    expect(calendlyPrefill(valid, keys).customAnswers).toEqual({
      a1: "+12145550123",
      a2: "Wedding",
    });
  });

  // The live event type has only Calendly's default question, which is notes.
  const notesOnly = { phone: null, occasion: null, notes: "a1" };

  it("carries answers without their own question into the notes, labelled, before the guest's", () => {
    expect(
      calendlyPrefill(
        { ...valid, occasion: "Other", occasionOther: "Graduation", notes: " Hi Hanna! " },
        notesOnly,
      ).customAnswers,
    ).toEqual({ a1: "Occasion: Other – Graduation\nPhone: +12145550123\n\nHi Hanna!" });
  });

  it("still carries them when the guest wrote no notes", () => {
    expect(calendlyPrefill(valid, notesOnly).customAnswers).toEqual({
      a1: "Occasion: Wedding\nPhone: +12145550123",
    });
  });

  it("carries only what lacks a question", () => {
    expect(
      calendlyPrefill({ ...valid, notes: "Hi" }, { phone: "a1", occasion: null, notes: "a2" })
        .customAnswers,
    ).toEqual({ a1: "+12145550123", a2: "Occasion: Wedding\n\nHi" });
  });

  it("drops an answer only when there is no notes question to carry it", () => {
    expect(
      calendlyPrefill(valid, { phone: null, occasion: null, notes: null }).customAnswers,
    ).toEqual({});
  });
});

describe("groupByLocalDay", () => {
  it("groups times by the visitor's own calendar day", () => {
    const url = "https://calendly.com/hs/consultation";
    const days = groupByLocalDay([
      { start: "2026-10-30T15:00:00.000Z", url },
      { start: "2026-10-30T20:00:00.000Z", url },
      { start: "2026-10-31T15:00:00.000Z", url },
    ]);
    const counts = [...days.values()].map((times) => times.length);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(3);
    for (const [day, times] of days) {
      for (const t of times) {
        const local = new Date(t.start);
        const iso = `${String(local.getFullYear())}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
        expect(iso).toBe(day);
      }
    }
  });
});
