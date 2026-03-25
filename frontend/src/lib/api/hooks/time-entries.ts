import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type {
  TimeEntry,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  StartTimerRequest,
} from "../types";

export const TIME_ENTRIES_KEY = ["time-entries"] as const;

interface TimeEntryListParams {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export function useTimeEntries(params: TimeEntryListParams = {}) {
  return useQuery({
    queryKey: [...TIME_ENTRIES_KEY, params],
    queryFn: () => {
      const search = new URLSearchParams();
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      if (params.page) search.set("page", String(params.page));
      if (params.pageSize) search.set("pageSize", String(params.pageSize));
      const qs = search.toString();
      return apiFetch<TimeEntry[]>(`/time-entries${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: [...TIME_ENTRIES_KEY, id],
    queryFn: () => apiFetch<TimeEntry>(`/time-entries/${id}`),
    enabled: !!id,
  });
}

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeEntryRequest) =>
      apiFetch<TimeEntry>("/time-entries", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY }),
  });
}

export function useUpdateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTimeEntryRequest;
    }) =>
      apiFetch<TimeEntry>(`/time-entries/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY }),
  });
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/time-entries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY }),
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StartTimerRequest) =>
      apiFetch<TimeEntry>("/time-entries/start", {
        method: "POST",
        body: data,
      }),
    onSuccess: (startedEntry) => {
      qc.setQueryData(RUNNING_ENTRY_KEY, startedEntry);
      qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY });
    },
  });
}

export const RUNNING_ENTRY_KEY = ["time-entries", "running"] as const;

export function useRunningEntry() {
  return useQuery({
    queryKey: RUNNING_ENTRY_KEY,
    queryFn: () => apiFetch<TimeEntry | null>("/time-entries/running"),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useAdjustTimerStart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, startTime }: { id: string; startTime: string }) =>
      apiFetch<TimeEntry>(`/time-entries/${id}/start-time`, {
        method: "PATCH",
        body: { startTime },
      }),
    onSuccess: (updatedEntry) => qc.setQueryData(RUNNING_ENTRY_KEY, updatedEntry),
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<TimeEntry>("/time-entries/stop", {
        method: "POST",
      }),
    onSuccess: () => {
      // Synchronously clear the running entry so the counter stops immediately
      qc.setQueryData(RUNNING_ENTRY_KEY, null);
      // Then refetch the completed entries list in the background
      qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY });
    },
  });
}

export function useBulkDeleteTimeEntries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch<void>("/time-entries/bulk-delete", {
        method: "POST",
        body: { ids },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TIME_ENTRIES_KEY }),
  });
}
