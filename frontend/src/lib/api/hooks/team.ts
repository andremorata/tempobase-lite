import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type {
  AccountInvite,
  CreateInviteRequest,
  TeamMember,
  UpdateTeamMemberRequest,
} from "../types";

export const TEAM_MEMBERS_KEY = ["team-members"] as const;
export const TEAM_INVITES_KEY = ["team-invites"] as const;

export function useTeamMembers() {
  return useQuery({
    queryKey: TEAM_MEMBERS_KEY,
    queryFn: () => apiFetch<TeamMember[]>("/team/members"),
  });
}

export function useInvites(enabled = true) {
  return useQuery({
    queryKey: TEAM_INVITES_KEY,
    queryFn: () => apiFetch<AccountInvite[]>("/team/invites"),
    enabled,
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInviteRequest = {}) =>
      apiFetch<AccountInvite>("/team/invites", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_INVITES_KEY }),
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch<void>(`/team/invites/${encodeURIComponent(token)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_INVITES_KEY }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateTeamMemberRequest }) =>
      apiFetch<TeamMember>(`/team/members/${memberId}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_MEMBERS_KEY }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      apiFetch<void>(`/team/members/${memberId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_MEMBERS_KEY }),
  });
}
