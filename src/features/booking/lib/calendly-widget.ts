/**
 * Calendly's popup widget, loaded on demand.
 *
 * Nothing from Calendly loads with the page. The script is fetched when the
 * guest picks a time — the moment intent is clear — so it is ready by the time
 * they press Reserve, and a visitor who only browses never loads third-party
 * code at all.
 *
 * Pre-filled answers travel to Calendly's iframe by `postMessage`, not in the
 * URL, so a guest's phone number never appears in a link, a log or a referrer.
 * That is the widget's own behaviour (verified in the served widget.js).
 */

/** The popup iframe's origin, and the only origin whose messages are trusted. */
export const CALENDLY_ORIGIN = "https://calendly.com";

const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

export interface CalendlyPrefill {
  readonly name: string;
  readonly email: string;
  /** Keyed `a1`–`a10`, by the question's position on Calendly's form. */
  readonly customAnswers: Readonly<Record<string, string>>;
}

interface CalendlyApi {
  initPopupWidget(options: { url: string; prefill?: CalendlyPrefill }): void;
  closePopupWidget(): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

let loading: Promise<CalendlyApi> | null = null;

export function loadCalendly(): Promise<CalendlyApi> {
  if (window.Calendly) return Promise.resolve(window.Calendly);

  loading ??= new Promise<CalendlyApi>((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.append(link);
    }
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    const fail = (reason: string) => {
      // Forget the attempt so pressing Reserve again retries the download.
      loading = null;
      script.remove();
      reject(new Error(reason));
    };
    script.onload = () => {
      if (window.Calendly) resolve(window.Calendly);
      else fail("Calendly's script loaded without its API");
    };
    script.onerror = () => {
      fail("Calendly's script failed to load");
    };
    document.head.append(script);
  });
  return loading;
}

/** The name of a Calendly embed event, or null for any other message. */
export function calendlyEventName(event: MessageEvent): string | null {
  if (event.origin !== CALENDLY_ORIGIN) return null;
  const data: unknown = event.data;
  if (typeof data !== "object" || data === null || !("event" in data)) return null;
  return typeof data.event === "string" && data.event.startsWith("calendly.") ? data.event : null;
}
