/**
 * Utility functions for handling Candid optional values that may arrive
 * in different shapes from the Motoko backend (undefined, null, [], [value], or tagged unions).
 */

/**
 * Unwraps a Candid optional value to its inner value or null.
 * Handles multiple representations:
 * - undefined/null → null
 * - [] → null
 * - [value] → value
 * - { __kind__: "None" } → null
 * - { __kind__: "Some", value } → value
 * - direct value → value
 */
export function unwrapOptional<T>(value: T | null | undefined | [] | [T] | { __kind__: 'None' } | { __kind__: 'Some'; value: T }): T | null {
  // Handle undefined or null
  if (value === undefined || value === null) {
    return null;
  }

  // Handle array representation (Candid optional)
  if (Array.isArray(value)) {
    if (value.length > 0) {
      const unwrapped = value[0];
      return unwrapped !== undefined ? unwrapped : null;
    }
    return null;
  }

  // Handle tagged union representation
  if (typeof value === 'object' && value !== null && '__kind__' in value) {
    const tagged = value as { __kind__: string; value?: T };
    if (tagged.__kind__ === 'None') {
      return null;
    }
    if (tagged.__kind__ === 'Some' && 'value' in tagged) {
      return tagged.value as T;
    }
  }

  // Direct value
  return value as T;
}

/**
 * Type guard to check if a value is an ExternalBlob-like object
 * (has a getDirectURL method).
 */
export function isExternalBlob(value: unknown): value is { getDirectURL: () => string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getDirectURL' in value &&
    typeof (value as any).getDirectURL === 'function'
  );
}

/**
 * Safely extracts the direct URL from an optional ExternalBlob field.
 * Returns null if the field is absent or not a valid ExternalBlob.
 */
export function getOptionalBlobUrl(
  optionalBlob: unknown
): string | null {
  try {
    const unwrapped = unwrapOptional(optionalBlob);
    if (unwrapped && isExternalBlob(unwrapped)) {
      return unwrapped.getDirectURL();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if an optional ExternalBlob field has a value present.
 */
export function hasOptionalBlob(optionalBlob: unknown): boolean {
  try {
    const unwrapped = unwrapOptional(optionalBlob);
    return unwrapped !== null && isExternalBlob(unwrapped);
  } catch {
    return false;
  }
}
