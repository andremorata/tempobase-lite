export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  defaultProjectId: string | null;
  canViewAmounts: boolean;
}

export interface ClientSummary {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  hourlyRate: number | null;
}

export interface Project {
  id: string;
  accountId: string;
  clientId: string | null;
  name: string;
  color: string | null;
  status: string;
  billingType: string;
  hourlyRate: number | null;
  budgetHours: number | null;
  isArchived: boolean;
  client: ClientSummary | null;
  tasks: Task[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface TimeEntry {
  id: string;
  accountId: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  description: string | null;
  entryDate: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  durationDecimal: number | null;
  isBillable: boolean;
  isRunning: boolean;
  projectName: string | null;
  taskName: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface StartTimerRequest {
  projectId?: string | null;
  taskId?: string | null;
  description?: string;
  isBillable?: boolean;
}

export interface UpdateTimerRequest {
  projectId?: string | null;
  taskId?: string | null;
  description?: string;
  isBillable?: boolean;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
