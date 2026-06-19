import { format, parseISO, startOfWeek } from "date-fns";

/**
 * Time bucket size used to aggregate tracked hours in a report chart.
 * Distinct from entity-level "group by" (Project/Client/Task).
 */
export type ChartGranularity = "day" | "week" | "month" | "year";

export const CHART_GRANULARITIES: readonly ChartGranularity[] = ["day", "week", "month", "year"];

export const DEFAULT_CHART_GRANULARITY: ChartGranularity = "month";

// Weeks bucket on Monday, matching the Weekly report and date presets.
const WEEK_STARTS_ON = 1 as const;

export function isChartGranularity(value: unknown): value is ChartGranularity {
  return value === "day" || value === "week" || value === "month" || value === "year";
}

/** Normalize an unknown persisted value to a valid granularity, falling back to the default. */
export function toChartGranularity(value: unknown): ChartGranularity {
  return isChartGranularity(value) ? value : DEFAULT_CHART_GRANULARITY;
}

/**
 * Reduce a YYYY-MM-DD entry date to its bucket key for the given granularity.
 * day → "YYYY-MM-DD", week → Monday "YYYY-MM-DD", month → "YYYY-MM", year → "YYYY".
 */
export function granularityBucketKey(entryDate: string, granularity: ChartGranularity): string {
  switch (granularity) {
    case "day":
      return entryDate.slice(0, 10);
    case "week":
      return format(startOfWeek(parseISO(entryDate), { weekStartsOn: WEEK_STARTS_ON }), "yyyy-MM-dd");
    case "year":
      return entryDate.slice(0, 4);
    case "month":
    default:
      return entryDate.slice(0, 7);
  }
}

/** Human-readable axis label for a bucket key produced by {@link granularityBucketKey}. */
export function granularityBucketLabel(key: string, granularity: ChartGranularity): string {
  switch (granularity) {
    case "day":
    case "week":
      return format(parseISO(key), "MMM d");
    case "year":
      return key;
    case "month":
    default:
      return format(parseISO(key + "-01"), "MMM yy");
  }
}

/** Chart heading reflecting the active granularity, e.g. "Hours per Day". */
export function granularityChartTitle(granularity: ChartGranularity): string {
  switch (granularity) {
    case "day":
      return "Hours per Day";
    case "week":
      return "Hours per Week";
    case "year":
      return "Hours per Year";
    case "month":
    default:
      return "Hours per Month";
  }
}
