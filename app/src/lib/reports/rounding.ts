/**
 * Rounding utilities for report display and API responses.
 *
 * Rounding is a display-only concern: stored TimeEntry records are never modified.
 * Granularity is locked at 10 minutes with a floor of 10 minutes per entry.
 */

const ROUNDUP_GRANULARITY_MIN = 10;
const MINIMUM_MINUTES = 10;

/**
 * Round a duration (in decimal hours) up to the nearest 10-minute increment,
 * with a minimum of 10 minutes. `null`/`undefined` (and `0`) pass through
 * unchanged so callers can round nullable durations without pre-checking.
 */
export function roundUpToTenMin(decimalHours: number): number;
export function roundUpToTenMin(decimalHours: null): null;
export function roundUpToTenMin(decimalHours: undefined): undefined;
export function roundUpToTenMin(
  decimalHours: number | null | undefined,
): number | null | undefined;
export function roundUpToTenMin(
  decimalHours: number | null | undefined,
): number | null | undefined {
  if (decimalHours == null || decimalHours === 0) return decimalHours;
  const minutes = decimalHours * 60;
  return Math.max(MINIMUM_MINUTES, Math.ceil(minutes / ROUNDUP_GRANULARITY_MIN) * ROUNDUP_GRANULARITY_MIN) / 60;
}

/**
 * Apply rounding to a single time entry's duration and billed amount.
 * Billed amounts are scaled proportionally to the rounded duration.
 */
export function applyRoundup(entry: {
  durationDecimal: number | null | undefined;
  billedAmount: number | null | undefined;
}): { durationDecimal: number | null | undefined; billedAmount: number | null | undefined } {
  if (entry.durationDecimal == null || entry.durationDecimal === 0) {
    return { durationDecimal: entry.durationDecimal, billedAmount: entry.billedAmount };
  }

  const rounded = roundUpToTenMin(entry.durationDecimal);
  const scaledBilledAmount =
    entry.billedAmount != null
      ? (entry.billedAmount / entry.durationDecimal) * rounded
      : entry.billedAmount;

  return { durationDecimal: rounded, billedAmount: scaledBilledAmount };
}

/** Roundup granularity constant for display or configuration. */
export const ROUNDUP_GRANULARITY_MINUTES = ROUNDUP_GRANULARITY_MIN;
