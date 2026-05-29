import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type { Client, CreateClientRequest, UpdateClientRequest } from "../types";

const CLIENTS_KEY = ["clients"] as const;

export function useClients() {
  return useQuery({
    queryKey: CLIENTS_KEY,
    queryFn: () => apiFetch<Client[]>("/clients"),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, id],
    queryFn: () => apiFetch<Client>(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) =>
      apiFetch<Client>("/clients", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) =>
      apiFetch<Client>(`/clients/${id}`, { method: "PUT", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}
