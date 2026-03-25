import type { PersistedReportGroupBy, ReportGroupByInput, SummaryGroupBy } from "@/lib/api/types";

const SUMMARY_TO_PERSISTED: Record<SummaryGroupBy, PersistedReportGroupBy> = {
  Project: "project",
  Client: "client",
  Task: "task",
};

const PERSISTED_TO_SUMMARY: Record<Exclude<PersistedReportGroupBy, "user" | "tag">, SummaryGroupBy> = {
  project: "Project",
  client: "Client",
  task: "Task",
};

export function toPersistedReportGroupBy(
  groupBy?: ReportGroupByInput | null,
): PersistedReportGroupBy {
  if (!groupBy) {
    return "project";
  }

  if (groupBy in SUMMARY_TO_PERSISTED) {
    return SUMMARY_TO_PERSISTED[groupBy as SummaryGroupBy];
  }

  return groupBy as PersistedReportGroupBy;
}

export function toSummaryReportGroupBy(
  groupBy?: ReportGroupByInput | null,
): SummaryGroupBy {
  const normalized = toPersistedReportGroupBy(groupBy);

  if (normalized === "project" || normalized === "client" || normalized === "task") {
    return PERSISTED_TO_SUMMARY[normalized];
  }

  return "Project";
}