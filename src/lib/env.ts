import { z } from "zod";

/**
 * Runtime configuration, validated once at import so a misconfigured deploy
 * fails loudly at boot rather than silently at the first booking.
 *
 * Everything the booking backend will need is optional today: the site builds
 * and runs without any of it, and the moment a value is present the matching
 * adapter can pick it up. docs/DEPLOYMENT.md lists what to set in Vercel.
 *
 * NEXT_PUBLIC_* values are read inline where used, so there is no client schema
 * until something actually needs one.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ── Booking persistence (not yet wired) ────────────────────────────────
  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // ── Transactional email (not yet wired) ────────────────────────────────
  RESEND_API_KEY: z.string().min(1).optional(),
  BOOKING_HOST_EMAIL: z.email().optional(),

  // ── Anti-abuse (not yet wired) ─────────────────────────────────────────
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
});

const serverEnv = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BOOKING_HOST_EMAIL: process.env.BOOKING_HOST_EMAIL,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
});

/** True once a persistence layer is configured. */
export const hasBookingBackend =
  Boolean(serverEnv.SUPABASE_URL) && Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);

/** True once transactional email is configured. */
export const hasEmailBackend = Boolean(serverEnv.RESEND_API_KEY);
