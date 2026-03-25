import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type { AuditLogListRequest, AuditLogListResponse } from "../types";

export const AUDIT_LOGS_KEY = ["audit-logs"] as const;

export function useAuditLogs(params: AuditLogListRequest) {
  return useQuery({
    queryKey: [...AUDIT_LOGS_KEY, params],
    queryFn: () => {
      const search = new URLSearchParams();

      if (params.search) search.set("search", params.search);
      if (params.action) search.set("action", params.action);
      if (params.entityType) search.set("entityType", params.entityType);
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      if (params.page) search.set("page", String(params.page));
      if (params.pageSize) search.set("pageSize", String(params.pageSize));

      const queryString = search.toString();
      return apiFetch<AuditLogListResponse>(`/audit-logs${queryString ? `?${queryString}` : ""}`);
    },
  });
}
