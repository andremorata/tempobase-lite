import { useMutation } from "@tanstack/react-query";
import { apiFetch, parseApiErrorResponse } from "../client";
import type { ImportParseResponse, ImportExecuteRequest, ImportExecuteResponse, ParseImportRequest } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// ─── File upload fetch (no Content-Type — browser sets multipart boundary) ───

async function apiFetchFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw await parseApiErrorResponse(res);
  }

  return res.json() as Promise<T>;
}

// ─── Parse CSV ────────────────────────────────────────────────────────────────

export function useParseCsvImport() {
  return useMutation({
    mutationFn: ({ file, dateFormat }: ParseImportRequest) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dateFormat", dateFormat);
      return apiFetchFormData<ImportParseResponse>("/imports/time-entries/parse", formData);
    },
  });
}

// ─── Execute import ───────────────────────────────────────────────────────────

export function useExecuteImport() {
  return useMutation({
    mutationFn: (data: ImportExecuteRequest) =>
      apiFetch<ImportExecuteResponse>("/imports/time-entries/execute", {
        method: "POST",
        body: data,
      }),
  });
}
