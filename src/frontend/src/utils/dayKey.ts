/**
 * Utility functions for normalizing date timestamps to day keys.
 * Ensures consistent day-level granularity for daily report storage and retrieval.
 * 
 * TIMEZONE SAFETY:
 * All functions use local calendar dates to prevent off-by-one-day errors.
 * Tested with GMT+7 (WIB) and GMT-5 to confirm no day shifts occur.
 */

/**
 * Normalizes a timestamp to the start of the day (midnight) in nanoseconds.
 * This ensures that all operations for a given calendar day use the same key.
 * 
 * @param date - Optional Date object or timestamp in milliseconds. Defaults to now.
 * @returns Nanosecond timestamp normalized to midnight (start of day)
 */
export function getStartOfDayNanoseconds(date?: Date | number): bigint {
  const dateObj = date instanceof Date ? date : new Date(date || Date.now());
  const midnightMs = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
  return BigInt(midnightMs) * BigInt(1_000_000);
}

/**
 * Gets today's day key (start of today in nanoseconds).
 * @returns Nanosecond timestamp for the start of today
 */
export function getTodayKey(): bigint {
  return getStartOfDayNanoseconds();
}

/**
 * Parses a date input value (YYYY-MM-DD) into a timezone-safe Date object.
 * Uses local calendar date construction to avoid UTC-based day shifts.
 * 
 * CRITICAL: Always use this function when parsing date input values to ensure
 * the selected calendar day matches the day key used for storage/retrieval.
 * 
 * @param dateString - Date string in YYYY-MM-DD format from date input
 * @returns Date object representing the selected calendar day in local time
 * 
 * @example
 * // User in GMT+7 selects "2026-02-16"
 * const date = parseDateInputSafe("2026-02-16");
 * // Returns Date for 2026-02-16 00:00:00 local time (not UTC)
 * // getStartOfDayNanoseconds(date) will use the correct day
 */
export function parseDateInputSafe(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Construct date using local calendar values (month is 0-indexed)
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object for use in a date input (YYYY-MM-DD).
 * Uses local calendar date to ensure consistency with parseDateInputSafe.
 * 
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
