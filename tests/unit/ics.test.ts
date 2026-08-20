import { describe, expect, it } from "vitest";
import { buildConsultationIcs } from "@/features/booking/lib/ics";
import { formatWhen } from "@/features/booking/lib/format";
import { guestEmailText, hostEmailText } from "@/features/booking/lib/notify";

const DETAILS = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  occasion: "Wedding",
  date: "2026-09-15",
  slot: "3:00 PM",
  reference: "HS-ABC123",
} as const;

describe("buildConsultationIcs", () => {
  it("emits floating local time, not server-timezone UTC", () => {
    // Regression guard: the default output converts using the server's clock, so
    // on a UTC host a 3:00 PM slot would reach the guest as 10:00 AM Dallas.
    expect(buildConsultationIcs(DETAILS)).not.toMatch(/DTSTART[^:]*:\d{8}T\d{6}Z/);
  });

  it("produces a valid VEVENT with the right start time", () => {
    const ics = buildConsultationIcs(DETAILS);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
    // 3:00 PM → 15:00 local
    expect(ics).toMatch(/DTSTART[^:]*:20260915T150000(?!Z)/);
    expect(ics).toContain("HS-ABC123");
  });

  it("converts every slot without throwing", () => {
    for (const slot of ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"] as const) {
      expect(() => buildConsultationIcs({ ...DETAILS, slot })).not.toThrow();
    }
  });

  it("maps 12:30 PM to 12:30, not 00:30", () => {
    expect(buildConsultationIcs({ ...DETAILS, slot: "12:30 PM" })).toMatch(
      /DTSTART[^:]*:20260915T123000(?!Z)/,
    );
  });

  it("maps 10:00 AM to 10:00", () => {
    expect(buildConsultationIcs({ ...DETAILS, slot: "10:00 AM" })).toMatch(
      /DTSTART[^:]*:20260915T100000(?!Z)/,
    );
  });
});

describe("email bodies", () => {
  it("addresses the guest and carries the details", () => {
    const text = guestEmailText(DETAILS);
    expect(text).toContain("Ada Lovelace");
    expect(text).toContain("HS-ABC123");
    expect(text).toContain(formatWhen(DETAILS.date, DETAILS.slot));
  });

  it("gives the host the enquiry", () => {
    expect(hostEmailText(DETAILS)).toContain("ada@example.com");
    expect(hostEmailText(DETAILS)).toContain("Wedding");
  });
});
