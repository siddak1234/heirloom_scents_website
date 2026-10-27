import "server-only";
import type { z } from "zod";
import type { Availability } from "../schema";
import {
  answerKeysFor,
  availableTimesSchema,
  chunkWindow,
  currentUserSchema,
  eventTypesSchema,
  monthWindow,
  pickEventType,
  toOpenTimes,
  type EventType,
} from "./calendly";

/*
 * Calendly's REST API, read with a personal access token.
 *
 * The token needs two scopes and no others: `users:read` to find the account,
 * `event_types:read` for the event type and its open times. It cannot book,
 * cancel or change anything. It lives in Vercel as CALENDLY_TOKEN and never
 * leaves the server — `server-only` makes importing this file from a client
 * component a build error, and scripts/audit-bundle.mjs checks the output.
 */

const CALENDLY_API = "https://api.calendly.com";

/** Event type and question settings change rarely; open times are never cached here. */
const SETTINGS_REVALIDATE_SECONDS = 300;

export class CalendlyNotConfiguredError extends Error {}

interface Config {
  readonly token: string;
  /** Overridable so the end-to-end suite can point at a local stand-in. */
  readonly base: string;
  readonly eventSlug: string | undefined;
}

function readConfig(): Config | null {
  const token = process.env.CALENDLY_TOKEN?.trim();
  if (!token) return null;
  return {
    token,
    base: (process.env.CALENDLY_API_BASE ?? CALENDLY_API).replace(/\/$/, ""),
    eventSlug: process.env.CALENDLY_EVENT_SLUG?.trim() || undefined,
  };
}

async function get<T>(
  config: Config,
  path: string,
  schema: z.ZodType<T>,
  revalidate: number | null,
): Promise<T> {
  const res = await fetch(`${config.base}${path}`, {
    headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    ...(revalidate === null ? { cache: "no-store" } : { next: { revalidate } }),
  });
  if (!res.ok) {
    // Calendly's error body names the problem ("insufficient scope", "not found").
    // The path and body are safe to log; the token is only ever in the header.
    const body = await res.text().catch(() => "");
    throw new Error(
      `Calendly ${path.split("?")[0] ?? path} → ${String(res.status)} ${body.slice(0, 300)}`,
    );
  }
  return schema.parse(await res.json());
}

async function getEventType(config: Config): Promise<EventType> {
  const me = await get(config, "/users/me", currentUserSchema, SETTINGS_REVALIDATE_SECONDS);
  const query = new URLSearchParams({ user: me.resource.uri, active: "true", count: "100" });
  const types = await get(
    config,
    `/event_types?${query.toString()}`,
    eventTypesSchema,
    SETTINGS_REVALIDATE_SECONDS,
  );
  return pickEventType(types.collection, config.eventSlug);
}

/**
 * Everything the booking form needs for one month: the open times, how long
 * the consultation is, and where each answer goes on Calendly's form.
 *
 * Throws `CalendlyNotConfiguredError` when no token is set, and a plain Error
 * for anything Calendly refuses.
 */
export async function getMonthAvailability(month: string, now: Date): Promise<Availability> {
  const config = readConfig();
  if (!config) throw new CalendlyNotConfiguredError("CALENDLY_TOKEN is not set");

  const eventType = await getEventType(config);
  const window = monthWindow(month, now);
  const pages = window
    ? await Promise.all(
        chunkWindow(window).map(({ start, end }) => {
          const query = new URLSearchParams({
            event_type: eventType.uri,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
          });
          return get(
            config,
            `/event_type_available_times?${query.toString()}`,
            availableTimesSchema,
            null,
          );
        }),
      )
    : [];

  const answerKeys = answerKeysFor(eventType.custom_questions);
  const unmatched = Object.entries(answerKeys)
    .filter(([, key]) => key === null)
    .map(([answer]) => answer);
  if (unmatched.length) {
    // Booking still works — the guest types these answers in Calendly's window
    // instead — but a question is missing or renamed. Naming what Calendly does
    // have makes the fix one look at the log. docs/DEPLOYMENT.md has the names.
    const shown = eventType.custom_questions.filter((q) => q.enabled).map((q) => `"${q.name}"`);
    console.warn(
      `[booking] Calendly event "${eventType.slug ?? eventType.uri}" has no question for: ${unmatched.join(", ")}. Its questions: ${shown.join(", ") || "none"}`,
    );
  }

  return {
    month,
    durationMinutes: eventType.duration,
    times: toOpenTimes(pages.flatMap((p) => p.collection)),
    answerKeys,
  };
}
