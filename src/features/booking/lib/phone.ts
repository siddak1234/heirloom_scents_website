/**
 * Normalises a typed phone number to E.164 ("+12145550123"), or null when it
 * cannot be one.
 *
 * North American numbers are the expected case — the bar serves Dallas–Fort
 * Worth — so ten digits, or eleven with a leading 1, are read as US. Family
 * booking from abroad write the number with a leading "+", which is taken as
 * already international. Formatting characters are ignored either way.
 *
 * E.164 is what Calendly's phone question parses without guessing a country.
 */
export function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (/[a-z]/i.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+"))
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
