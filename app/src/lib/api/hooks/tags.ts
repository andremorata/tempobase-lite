import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type { Tag, CreateTagRequest, UpdateTagRequest } from "../types";

export const TAGS_KEY = ["tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => apiFetch<Tag[]>("/tags"),
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: [...TAGS_KEY, id],
    queryFn: () => apiFetch<Tag>(`/tags/${id}`),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagRequest) =>
      apiFetch<Tag>("/tags", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      apiFetch<Tag>(`/tags/${id}`, { method: "PUT", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}
