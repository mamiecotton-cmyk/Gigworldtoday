/**
 * Parse a "YYYY-MM-DD" string as a LOCAL date (midnight in user's timezone),
 * not UTC. Avoids the off-by-one bug where new Date("2026-04-27") is parsed
 * as UTC midnight and renders as April 26 in negative-offset timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format a "YYYY-MM-DD" string for display, timezone-safe.
 */
export function formatLocalDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  return parseLocalDate(dateStr).toLocaleDateString(undefined, options);
}