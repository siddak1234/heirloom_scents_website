import type { Metadata } from "next";
import { BookingScreen } from "@/components/sections/booking";

export const metadata: Metadata = {
  title: "Book an Event",
  description:
    "Reserve a complimentary 30-minute consultation and we’ll plan your fragrance bar together.",
};

export default function BookingPage() {
  return <BookingScreen />;
}
