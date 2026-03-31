/**
 * Member access resolution helpers.
 *
 * Resolves per-user project and task restrictions for non-Owner/Admin members.
 * Results are used as Prisma where-clause filters across all data-fetching routes.
 */

import { prisma } from "@/lib/db/prisma";

export interface MemberAccess {
  /** null = unrestricted (Owner/Admin or no rows configured) */
  projectIds: string[] | null;
  /** null = unrestricted (no task-level rows configured) */
  taskIds: string[] | null;
}

/**
 * Resolves the effective project/task access filter for a given user.
 * Owner and Admin always receive null values (unrestricted).
 * Other roles receive the stored access lists, or null if none are configured
 * (meaning full access to all projects/tasks).
 */
export async function getMemberAccess(
  userId: string,
  accountId: string,
  role: string,
): Promise<MemberAccess> {
  if (role === "Owner" || role === "Admin") {
    return { projectIds: null, taskIds: null };
  }

  const [projectAccess, taskAccess] = await Promise.all([
    prisma.userProjectAccess.findMany({
      where: { userId, accountId },
      select: { projectId: true },
    }),
    prisma.userTaskAccess.findMany({
      where: { userId, accountId },
      select: { taskId: true },
    }),
  ]);

  return {
    projectIds: projectAccess.length > 0 ? projectAccess.map((a) => a.projectId) : null,
    taskIds: taskAccess.length > 0 ? taskAccess.map((a) => a.taskId) : null,
  };
}

/**
 * Applies project and task access restrictions to a Prisma where clause object.
 *
 * If the caller already specified a concrete projectId/taskId filter (e.g. from
 * query params), this intersects it with the allowed list so out-of-scope IDs
 * yield zero results rather than leaking data.
 */
export function applyAccessFilter(
  where: Record<string, any>,
  access: MemberAccess,
  queryProjectId?: string,
  queryTaskId?: string,
): void {
  if (access.projectIds !== null) {
    // Intersect with any caller-supplied projectId
    const allowed = queryProjectId
      ? access.projectIds.filter((id) => id === queryProjectId)
      : access.projectIds;
    where.projectId = { in: allowed };
  } else if (queryProjectId) {
    where.projectId = queryProjectId;
  }

  if (access.taskIds !== null) {
    // Intersect with any caller-supplied taskId
    const allowed = queryTaskId
      ? access.taskIds.filter((id) => id === queryTaskId)
      : access.taskIds;
    where.taskId = { in: allowed };
  } else if (queryTaskId) {
    where.taskId = queryTaskId;
  }
}

/**
 * Returns true if the given projectId is accessible to the user.
 * A null/undefined projectId (no project selected) is always allowed.
 */
export function isProjectAccessible(
  access: MemberAccess,
  projectId: string | null | undefined,
): boolean {
  if (access.projectIds === null) return true;
  if (!projectId) return true;
  return access.projectIds.includes(projectId);
}

/**
 * Returns true if the given taskId is accessible to the user.
 * A null/undefined taskId (no task selected) is always allowed.
 */
export function isTaskAccessible(
  access: MemberAccess,
  taskId: string | null | undefined,
): boolean {
  if (access.taskIds === null) return true;
  if (!taskId) return true;
  return access.taskIds.includes(taskId);
}
