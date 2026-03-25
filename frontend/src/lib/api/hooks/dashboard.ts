import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { DashboardResponse } from "@/lib/api/types";

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardResponse>("/dashboard"),
    staleTime: 60 * 1000,   // 1 minute — dashboard data is relatively stable
  });
}
