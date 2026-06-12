import { API_BASE_URL, API_ROUTES } from '@/config';
import type { ApiError, Project, TimeEntry, User, StartTimerRequest } from './types';

export class TempoBaseError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: ApiError
  ) {
    super(message);
    this.name = 'TempoBaseError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new TempoBaseError('Not authenticated', 401);
  }
  if (response.status === 403) {
    throw new TempoBaseError('Forbidden', 403);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText })) as ApiError;
    throw new TempoBaseError(payload.error || response.statusText, response.status, payload);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  });
  return handleResponse<T>(response);
}

export async function getMe(): Promise<User> {
  return api<User>(API_ROUTES.me);
}

export async function getProjects(): Promise<Project[]> {
  return api<Project[]>(API_ROUTES.projects);
}

export async function getRunningTimer(): Promise<TimeEntry | null> {
  return api<TimeEntry | null>(API_ROUTES.running);
}

export async function startTimer(request: StartTimerRequest): Promise<TimeEntry> {
  return api<TimeEntry>(API_ROUTES.start, {
    method: 'POST',
    body: JSON.stringify({
      projectId: request.projectId ?? null,
      taskId: request.taskId ?? null,
      description: request.description?.trim() ?? '',
      isBillable: request.isBillable ?? false,
    }),
  });
}

export async function stopTimer(): Promise<TimeEntry> {
  return api<TimeEntry>(API_ROUTES.stop, {
    method: 'POST',
  });
}

export async function adjustStartTime(entryId: string, startTime: string): Promise<TimeEntry> {
  return api<TimeEntry>(`${API_BASE_URL}/api/time-entries/${entryId}/start-time`, {
    method: 'PATCH',
    body: JSON.stringify({ startTime }),
  });
}

export async function updateRunningTimer(
  entryId: string,
  request: Partial<StartTimerRequest>
): Promise<TimeEntry> {
  return api<TimeEntry>(`${API_BASE_URL}/api/time-entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...(request.projectId !== undefined && { projectId: request.projectId ?? null }),
      ...(request.taskId !== undefined && { taskId: request.taskId ?? null }),
      ...(request.description !== undefined && { description: request.description?.trim() ?? '' }),
      ...(request.isBillable !== undefined && { isBillable: request.isBillable }),
    }),
  });
}
