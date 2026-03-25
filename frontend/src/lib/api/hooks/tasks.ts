import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type {
  ProjectTask,
  CreateProjectTaskRequest,
  UpdateProjectTaskRequest,
} from "../types";

const TASKS_KEY = ["tasks"] as const;

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, { projectId }],
    queryFn: () =>
      apiFetch<ProjectTask[]>(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectTaskRequest) =>
      apiFetch<ProjectTask>(`/projects/${data.projectId}/tasks`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      projectId,
      data,
    }: {
      id: string;
      projectId: string;
      data: UpdateProjectTaskRequest;
    }) =>
      apiFetch<ProjectTask>(`/projects/${projectId}/tasks/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      apiFetch<void>(`/projects/${projectId}/tasks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
