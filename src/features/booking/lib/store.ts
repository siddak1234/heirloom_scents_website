import { StaticAvailability, type AvailabilityStore } from "./availability";
import { ConsoleNotifier, type Notifier } from "./notify";
import { hasBookingBackend, hasEmailBackend } from "@/lib/env";

/**
 * Single seam where the real backends get plugged in.
 *
 * Today both resolve to the local implementations. When SUPABASE_* and
 * RESEND_API_KEY are set in Vercel, swap the constructors here — nothing else
 * in the app refers to a concrete implementation.
 */
export function getAvailabilityStore(): AvailabilityStore {
  if (hasBookingBackend) {
    // TODO(supabase): return new SupabaseAvailability(serverEnv.SUPABASE_URL, ...)
  }
  return new StaticAvailability();
}

export function getNotifier(): Notifier {
  if (hasEmailBackend) {
    // TODO(resend): return new ResendNotifier(serverEnv.RESEND_API_KEY)
  }
  return new ConsoleNotifier();
}
