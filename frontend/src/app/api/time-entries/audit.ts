type TimeEntryAuditRecord = {
  projectId: string | null;
  taskId: string | null;
  description: string | null;
  entryDate?: Date | string | null;
  startTime: Date | string;
  endTime?: Date | string | null;
  duration?: number | null;
  durationDecimal?: number | string | { toString(): string } | null;
  isBillable: boolean;
  isRunning: boolean;
};

function toDateOnly(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value;
  }

  return value.toISOString().split("T")[0];
}

export function toTimeEntryAuditSnapshot(entry: TimeEntryAuditRecord) {
  return {
    projectId: entry.projectId ?? null,
    taskId: entry.taskId ?? null,
    description: entry.description ?? null,
    entryDate: toDateOnly(entry.entryDate ?? entry.startTime),
    startTime: entry.startTime,
    endTime: entry.endTime ?? null,
    duration: entry.duration ?? null,
    durationDecimal:
      entry.durationDecimal != null ? Number(entry.durationDecimal) : null,
    isBillable: entry.isBillable,
    isRunning: entry.isRunning,
  };
}

export function summarizeTimeEntryAudit(
  action: "create" | "start" | "stop" | "update" | "delete",
  entry: TimeEntryAuditRecord,
): string {
  const snapshot = toTimeEntryAuditSnapshot(entry);
  const dateLabel = snapshot.entryDate;
  const durationLabel =
    snapshot.durationDecimal != null ? `${snapshot.durationDecimal.toFixed(2)}h` : null;

  switch (action) {
    case "create":
      return `Created time entry: ${durationLabel ?? "0.00h"} on ${dateLabel}`;
    case "start":
      return `Started timer on ${dateLabel}`;
    case "stop":
      return `Stopped timer: ${durationLabel ?? "0.00h"} on ${dateLabel}`;
    case "update":
      return `Updated time entry on ${dateLabel}`;
    case "delete":
      return `Deleted time entry on ${dateLabel}`;
  }
}
