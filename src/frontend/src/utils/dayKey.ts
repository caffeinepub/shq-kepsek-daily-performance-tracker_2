/**
 * Utility functions for normalizing date timestamps to day keys.
 * Ensures consistent day-level granularity for daily report storage and retrieval.
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
