import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type {
  AccountExportResponse,
  AccountSettings,
  ChangePasswordRequest,
  DeleteCurrentUserRequest,
  DeleteWorkspaceRequest,
  PurgeTimeEntriesRequest,
  PurgeTimeEntriesResponse,
  UpdateAccountRequest,
  UpdateUserProfileRequest,
  UserProfile,
} from "../types";

export const ACCOUNT_KEY = ["account-settings"] as const;
export const PROFILE_KEY = ["current-user-profile"] as const;

export function useAccount() {
  return useQuery({
    queryKey: ACCOUNT_KEY,
    queryFn: () => apiFetch<AccountSettings>("/account"),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAccountRequest) =>
      apiFetch<AccountSettings>("/account", { method: "PUT", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEY }),
  });
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch<UserProfile>("/users/me"),
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      apiFetch<UserProfile>("/users/me", { method: "PUT", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      apiFetch<void>("/auth/change-password", { method: "POST", body: data }),
  });
}

export function useExportAccount() {
  return useMutation({
    mutationFn: () => apiFetch<AccountExportResponse>("/account/export"),
  });
}

export function usePurgeTimeEntries() {
  return useMutation({
    mutationFn: (data: PurgeTimeEntriesRequest) =>
      apiFetch<PurgeTimeEntriesResponse>("/account/purge/time-entries", {
        method: "POST",
        body: data,
      }),
  });
}

export function useDeleteWorkspace() {
  return useMutation({
    mutationFn: (data: DeleteWorkspaceRequest) =>
      apiFetch<void>("/account/purge/workspace", {
        method: "POST",
        body: data,
      }),
  });
}

export function useDeleteCurrentUser() {
  return useMutation({
    mutationFn: (data: DeleteCurrentUserRequest) =>
      apiFetch<void>("/account/purge/me", {
        method: "POST",
        body: data,
      }),
  });
}
