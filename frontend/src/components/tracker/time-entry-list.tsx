"use client";

import { useState, useMemo } from "react";
import { Copy, Pencil, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTimeEntries,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  useCreateTimeEntry,
  useStartTimer,
  useRunningEntry,
} from "@/lib/api/hooks/time-entries";
import { useProjects } from "@/lib/api/hooks/projects";
import { useTags } from "@/lib/api/hooks/tags";
import { formatDuration, formatTime } from "@/lib/format";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProjectSelector } from "@/components/shared/project-selector";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api/client";
import type { TimeEntry } from "@/lib/api/types";
import { toast } from "sonner";

// ─── Date helpers ────────────────────────────────────────────────────────────

function toLocalDateKey(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(localDateKey: string): string {
  const [y, mo, day] = localDateKey.split("-").map(Number);
  const now = new Date();
  if (y === now.getFullYear() && mo === now.getMonth() + 1 && day === now.getDate())
    return "Today";
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (y === yest.getFullYear() && mo === yest.getMonth() + 1 && day === yest.getDate())
    return "Yesterday";
  return new Date(y, mo - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Returns the ISO date key (YYYY-MM-DD) for the Monday of the week containing localDateKey. */
function getWeekStartKey(localDateKey: string): string {
  const [y, mo, day] = localDateKey.split("-").map(Number);
  const d = new Date(y, mo - 1, day);
  const dow = d.getDay(); // 0=Sun, 1=Mon, …
  const daysBack = dow === 0 ? 6 : dow - 1; // shift to Monday
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekDisplayLabel(weekStartKey: string): string {
  const now = new Date();
  const nowKey = toLocalDateKey(now.toISOString());
  const thisWeekKey = getWeekStartKey(nowKey);
  const [ty, tmo, td] = thisWeekKey.split("-").map(Number);
  const lwDate = new Date(ty, tmo - 1, td - 7);
  const lastWeekKey = `${lwDate.getFullYear()}-${String(lwDate.getMonth() + 1).padStart(2, "0")}-${String(lwDate.getDate()).padStart(2, "0")}`;

  if (weekStartKey === thisWeekKey) return "This week";
  if (weekStartKey === lastWeekKey) return "Last week";

  const [wy, wmo, wday] = weekStartKey.split("-").map(Number);
  return new Date(wy, wmo - 1, wday).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }) + " week";
}

// ─── Time / duration helpers ─────────────────────────────────────────────────

function parseTimeInput(raw: string): { hours: number; minutes: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let hours: number;
  let minutes: number;

  if (trimmed.includes(":")) {
    const [hStr, mStr] = trimmed.split(":");
    hours = parseInt(hStr ?? "0", 10);
    minutes = parseInt(mStr ?? "0", 10);
  } else {
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length <= 2) {
      hours = parseInt(digits, 10);
      minutes = 0;
    } else if (digits.length === 3) {
      hours = parseInt(digits[0], 10);
      minutes = parseInt(digits.slice(1), 10);
    } else {
      hours = parseInt(digits.slice(0, 2), 10);
      minutes = parseInt(digits.slice(2, 4), 10);
    }
  }

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function fmt(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseDurationInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let hours: number;
  let minutes: number;

  if (trimmed.includes(":")) {
    const [hStr, mStr] = trimmed.split(":");
    hours = parseInt(hStr ?? "0", 10);
    minutes = parseInt(mStr ?? "0", 10);
  } else {
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length <= 2) {
      hours = parseInt(digits, 10);
      minutes = 0;
    } else if (digits.length === 3) {
      hours = parseInt(digits[0], 10);
      minutes = parseInt(digits.slice(1), 10);
    } else {
      hours = parseInt(digits.slice(0, 2), 10);
      minutes = parseInt(digits.slice(2, 4), 10);
    }
  }

  if (isNaN(hours) || isNaN(minutes) || minutes > 59) return null;
  return hours * 60 + minutes;
}

function buildISO(
  _baseISO: string,
  localYear: number,
  localMonth: number,
  localDate: number,
  hours: number,
  minutes: number,
): string {
  return new Date(localYear, localMonth, localDate, hours, minutes, 0, 0).toISOString();
}

// ─── Grouping ────────────────────────────────────────────────────────────────

interface GroupedEntries {
  date: string;
  label: string;
  entries: TimeEntry[];
  totalSeconds: number;
}

interface WeekGroup {
  weekKey: string;
  weekLabel: string;
  days: GroupedEntries[];
  totalSeconds: number;
}

function groupByDay(entries: TimeEntry[]): GroupedEntries[] {
  const map = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const key = toLocalDateKey(entry.startTime);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, ents]) => ({
      date,
      label: dayLabel(date),
      entries: ents,
      totalSeconds: ents.reduce((sum, e) => sum + (e.durationDecimal ?? 0) * 3600, 0),
    }));
}

function groupByWeek(dayGroups: GroupedEntries[]): WeekGroup[] {
  const weekMap = new Map<string, GroupedEntries[]>();
  for (const day of dayGroups) {
    const wk = getWeekStartKey(day.date);
    const list = weekMap.get(wk) ?? [];
    list.push(day);
    weekMap.set(wk, list);
  }
  return Array.from(weekMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([wk, days]) => ({
      weekKey: wk,
      weekLabel: weekDisplayLabel(wk),
      days: days.sort((a, b) => b.date.localeCompare(a.date)),
      totalSeconds: days.reduce((sum, d) => sum + d.totalSeconds, 0),
    }));
}

function secondsToDisplay(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TimeEntryList() {
  const { data: entries } = useTimeEntries({ pageSize: 200 });
  const { data: projects } = useProjects();
  const { data: tags } = useTags();
  const { data: runningEntry } = useRunningEntry();
  const updateEntry = useUpdateTimeEntry();
  const deleteEntry = useDeleteTimeEntry();
  const createEntry = useCreateTimeEntry();
  const startTimer = useStartTimer();

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showMutationErrorToast = (title: string, error: unknown, fallback: string) => {
    toast.error(title, {
      description: getApiErrorMessage(error, fallback),
    });
  };

  const projectMap = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    projects?.forEach((p) => m.set(p.id, { name: p.name, color: p.color }));
    return m;
  }, [projects]);

  const tagMap = useMemo(() => {
    const m = new Map<string, { name: string; color?: string | null }>();
    tags?.forEach((t) => m.set(t.id, { name: t.name, color: t.color }));
    return m;
  }, [tags]);

  const completedEntries = useMemo(
    () => (entries ?? []).filter((e) => !e.isRunning),
    [entries],
  );
  const weekGroups = useMemo(
    () => groupByWeek(groupByDay(completedEntries)),
    [completedEntries],
  );

  // ── Edit dialog ────────────────────────────────────────────────────────────

  const openEdit = (entry: TimeEntry) => {
    const start = new Date(entry.startTime);
    setEditingEntry(entry);
    setEditDesc(entry.description ?? "");
    setEditTagIds([...(entry.tagIds ?? [])]);
    setEditProjectId(entry.projectId ?? null);
    setEditTaskId(entry.taskId ?? null);
    setEditDate(
      `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
    );
    setEditStart(fmt(start.getHours(), start.getMinutes()));
    if (entry.endTime) {
      const end = new Date(entry.endTime);
      setEditEnd(fmt(end.getHours(), end.getMinutes()));
    } else {
      setEditEnd("");
    }
    if (entry.durationDecimal != null) {
      const totalMins = Math.round(entry.durationDecimal * 60);
      setEditDuration(fmt(Math.floor(totalMins / 60), totalMins % 60));
    } else {
      setEditDuration("");
    }
    setValidationError(null);
  };

  const handleStartBlur = () => {
    const parsed = parseTimeInput(editStart);
    if (!parsed) { setValidationError("Invalid start time"); return; }
    setEditStart(fmt(parsed.hours, parsed.minutes));
    setValidationError(null);
    const parsedEnd = parseTimeInput(editEnd);
    if (parsedEnd) {
      let diff = (parsedEnd.hours * 60 + parsedEnd.minutes) - (parsed.hours * 60 + parsed.minutes);
      if (diff < 0) diff += 24 * 60;
      setEditDuration(fmt(Math.floor(diff / 60), diff % 60));
    }
  };

  const handleEndBlur = () => {
    const parsed = parseTimeInput(editEnd);
    if (!parsed) { setValidationError("Invalid end time"); return; }
    setEditEnd(fmt(parsed.hours, parsed.minutes));
    setValidationError(null);
    const parsedStart = parseTimeInput(editStart);
    if (parsedStart) {
      let diff = (parsed.hours * 60 + parsed.minutes) - (parsedStart.hours * 60 + parsedStart.minutes);
      if (diff < 0) diff += 24 * 60;
      setEditDuration(fmt(Math.floor(diff / 60), diff % 60));
    }
  };

  const handleDurationBlur = () => {
    const minutes = parseDurationInput(editDuration);
    if (minutes == null || minutes < 0) { setValidationError("Invalid duration"); return; }
    setEditDuration(fmt(Math.floor(minutes / 60), minutes % 60));
    setValidationError(null);
    const parsedStart = parseTimeInput(editStart);
    if (parsedStart) {
      const totalEnd = parsedStart.hours * 60 + parsedStart.minutes + minutes;
      setEditEnd(fmt(Math.floor(totalEnd / 60) % 24, totalEnd % 60));
    }
  };

  const handleSave = () => {
    if (!editingEntry) return;
    const parsedStart = parseTimeInput(editStart);
    const parsedEnd = parseTimeInput(editEnd);
    if (!parsedStart) { setValidationError("Invalid start time"); return; }
    if (!parsedEnd) { setValidationError("Invalid end time"); return; }

    const [y, mo1, d] = editDate.split("-").map(Number);
    const mo = mo1 - 1; // date input is 1-indexed; new Date() month is 0-indexed

    const newStartISO = buildISO(editingEntry.startTime, y, mo, d, parsedStart.hours, parsedStart.minutes);

    const startMins = parsedStart.hours * 60 + parsedStart.minutes;
    const endMins = parsedEnd.hours * 60 + parsedEnd.minutes;
    const nextDay = endMins < startMins;
    const newEndISO = buildISO(editingEntry.startTime, y, mo, nextDay ? d + 1 : d, parsedEnd.hours, parsedEnd.minutes);

    updateEntry.mutate(
      {
        id: editingEntry.id,
        data: {
          startTime: newStartISO,
          endTime: newEndISO,
          description: editDesc || undefined,
          projectId: editProjectId,
          taskId: editTaskId,
          isBillable: editingEntry.isBillable,
          tagIds: editTagIds,
        },
      },
      {
        onSuccess: () => setEditingEntry(null),
        onError: (err) =>
          showMutationErrorToast("Could not save time entry.", err, "Failed to save time entry."),
      },
    );
  };

  return (
    <div className="space-y-8">
      {weekGroups.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No time entries yet. Start the timer above!
        </p>
      )}

      {weekGroups.map((week) => (
        <div key={week.weekKey} className="space-y-4">
          {/* Week header */}
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {week.weekLabel}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {secondsToDisplay(week.totalSeconds)}
            </span>
          </div>

          {/* Day groups within the week */}
          {week.days.map((group) => (
            <div key={group.date} className="space-y-1">
              <div className="mb-1 flex items-center justify-between px-0.5">
                <h4 className="text-sm font-medium">{group.label}</h4>
                <span className="text-sm text-muted-foreground font-mono">
                  {secondsToDisplay(group.totalSeconds)}
                </span>
              </div>
              <div className="divide-y rounded-lg border bg-card">
                {group.entries.map((entry) => {
                  const project = entry.projectId
                    ? projectMap.get(entry.projectId)
                    : null;

                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
                    >
                      {/* Line 1 (mobile): description + tags + project badge + billable */}
                      <div className="flex items-center gap-2 sm:contents">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm">
                            {entry.description || (
                              <span className="text-muted-foreground italic">
                                (no description)
                              </span>
                            )}
                          </p>
                          {entry.tagIds && entry.tagIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.tagIds.map((tid) => {
                                const tag = tagMap.get(tid);
                                if (!tag) return null;
                                return (
                                  <span
                                    key={tid}
                                    className="inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium leading-none"
                                    style={
                                      tag.color
                                        ? { borderColor: tag.color, color: tag.color }
                                        : undefined
                                    }
                                  >
                                    {tag.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Project badge */}
                        {project && (
                          <Badge
                            variant="outline"
                            className="shrink-0"
                            style={{ borderColor: project.color, color: project.color }}
                          >
                            {project.name}
                          </Badge>
                        )}

                        {/* Billable */}
                        {entry.isBillable && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            $
                          </Badge>
                        )}
                      </div>

                      {/* Line 2 (mobile): time range + duration */}
                      <div className="flex items-center gap-3 sm:contents">
                        {/* Time range */}
                        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(entry.startTime)}
                          {entry.endTime && ` – ${formatTime(entry.endTime)}`}
                        </span>

                        {/* Duration */}
                        <span className="shrink-0 font-mono text-sm tabular-nums sm:w-16 sm:text-right">
                          {formatDuration(entry.duration)}
                        </span>
                      </div>

                      {/* Line 3 (mobile): action buttons */}
                      <div className="flex shrink-0 gap-1">
                        {!runningEntry && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                              startTimer.mutate({
                                description: entry.description ?? undefined,
                                projectId: entry.projectId ?? undefined,
                                taskId: entry.taskId ?? undefined,
                                isBillable: entry.isBillable,
                              }, {
                                onError: (error) => {
                                  showMutationErrorToast("Could not continue timer.", error, "Failed to continue this entry.");
                                },
                              })
                            }
                            disabled={startTimer.isPending}
                            title="Continue this entry"
                          >
                            <Play className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Duplicate entry"
                          disabled={createEntry.isPending}
                          onClick={() =>
                            createEntry.mutate(
                              {
                                startTime: entry.startTime,
                                endTime: entry.endTime!,
                                description: entry.description ?? undefined,
                                projectId: entry.projectId ?? undefined,
                                taskId: entry.taskId ?? undefined,
                                isBillable: entry.isBillable,
                                tagIds: entry.tagIds,
                              },
                              {
                                onSuccess: (newEntry) => openEdit(newEntry),
                                onError: (error) => {
                                  showMutationErrorToast("Could not duplicate time entry.", error, "Failed to duplicate the selected entry.");
                                },
                              },
                            )
                          }
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => openEdit(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDeleteId(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit time entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="What were you working on?"
              />
            </div>
            <div className="space-y-2">
              <Label>Project &amp; Task</Label>
              <ProjectSelector
                projectId={editProjectId}
                taskId={editTaskId}
                onProjectChange={setEditProjectId}
                onTaskChange={setEditTaskId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:text-foreground"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Start</Label>
                <Input
                  id="edit-start"
                  value={editStart}
                  onChange={(e) => { setEditStart(e.target.value); setValidationError(null); }}
                  onBlur={handleStartBlur}
                  placeholder="09:00"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">End</Label>
                <Input
                  id="edit-end"
                  value={editEnd}
                  onChange={(e) => { setEditEnd(e.target.value); setValidationError(null); }}
                  onBlur={handleEndBlur}
                  placeholder="10:30"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={editDuration}
                  onChange={(e) => { setEditDuration(e.target.value); setValidationError(null); }}
                  onBlur={handleDurationBlur}
                  placeholder="1:30"
                  className="font-mono"
                />
              </div>
            </div>
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            {tags && tags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const selected = editTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setEditTagIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== tag.id)
                              : [...prev, tag.id],
                          )
                        }
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground hover:text-foreground"
                        }`}
                        style={
                          !selected && tag.color
                            ? { borderColor: tag.color, color: tag.color }
                            : selected && tag.color
                              ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                              : undefined
                        }
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateEntry.isPending}>
              {updateEntry.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete time entry"
        description="This time entry will be permanently deleted."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteEntry.isPending}
        onConfirm={() => {
          if (deleteId)
            deleteEntry.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
              onError: (error) => {
                showMutationErrorToast("Could not delete time entry.", error, "Failed to delete the selected time entry.");
              },
            });
        }}
      />
    </div>
  );
}
