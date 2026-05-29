import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type {
  SummaryReportResponse,
  DetailedReportResponse,
  WeeklyReportResponse,
  SharedReportResponse,
  CreateSharedReportRequest,
  SavedReportDto,
  CreateSavedReportRequest,
  UpdateSavedReportRequest,
  SummaryGroupBy,
  ReportFilters,
} from "../types";

// ─── Query key factories ──────────────────────────────────────────────────────

export const REPORTS_KEY = ["reports"] as const;

function buildQs(filters: ReportFilters & { groupBy?: SummaryGroupBy; page?: number; pageSize?: number }): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.taskId) params.set("taskId", filters.taskId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.tagId) params.set("tagId", filters.tagId);
  if (filters.billable !== null && filters.billable !== undefined)
    params.set("billable", String(filters.billable));
  if (filters.description) params.set("description", filters.description);
  if (filters.groupBy) params.set("groupBy", filters.groupBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Summary report ───────────────────────────────────────────────────────────

export interface SummaryReportParams extends ReportFilters {
  groupBy?: SummaryGroupBy;
}

export function useSummaryReport(params: SummaryReportParams = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, "summary", params],
    queryFn: () => apiFetch<SummaryReportResponse>(`/reports/summary${buildQs(params)}`),
  });
}

// ─── Detailed report ──────────────────────────────────────────────────────────

export interface DetailedReportParams extends ReportFilters {
  page?: number;
  pageSize?: number;
}

export function useDetailedReport(params: DetailedReportParams = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, "detailed", params],
    queryFn: () => apiFetch<DetailedReportResponse>(`/reports/detailed${buildQs(params)}`),
  });
}

// ─── Weekly report ────────────────────────────────────────────────────────────

export function useWeeklyReport(params: ReportFilters = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, "weekly", params],
    queryFn: () => apiFetch<WeeklyReportResponse>(`/reports/weekly${buildQs(params)}`),
  });
}

// ─── Shared reports ───────────────────────────────────────────────────────────

export const SHARES_KEY = ["report-shares"] as const;

export function useSharedReports() {
  return useQuery({
    queryKey: SHARES_KEY,
    queryFn: () => apiFetch<SharedReportResponse[]>("/reports/shares"),
  });
}

export function useCreateSharedReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSharedReportRequest) =>
      apiFetch<SharedReportResponse>("/reports/shares", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHARES_KEY }),
  });
}

export function useDeleteSharedReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/reports/shares/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHARES_KEY }),
  });
}

// ─── Saved reports ────────────────────────────────────────────────────────────

export const SAVED_REPORTS_KEY = ["saved-reports"] as const;

export function useSavedReports() {
  return useQuery({
    queryKey: SAVED_REPORTS_KEY,
    queryFn: () => apiFetch<SavedReportDto[]>("/reports/saved"),
  });
}

export function useCreateSavedReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavedReportRequest) =>
      apiFetch<SavedReportDto>("/reports/saved", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SAVED_REPORTS_KEY }),
  });
}

export function useUpdateSavedReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSavedReportRequest & { id: string }) =>
      apiFetch<SavedReportDto>(`/reports/saved/${id}`, { method: "PUT", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SAVED_REPORTS_KEY }),
  });
}

export function useDeleteSavedReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/reports/saved/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SAVED_REPORTS_KEY }),
  });
}
