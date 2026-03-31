/**
 * Audit Logging Helper
 *
 * Centralized utility for creating audit log entries across the application.
 */

import { prisma } from "@/lib/db/prisma";

export interface AuditLogParams {
  accountId: string;
  actorUserId: string | null;
  actorEmail: string;
  actorName: string;
  actorRole: string;
  action: string; // e.g., "create", "update", "delete", "login", "export"
  entityType: string; // e.g., "TimeEntry", "Project", "Client", "User"
  entityId: string;
  summary: string; // Human-readable description
  changesJson?: Record<string, any>; // Optional details about what changed
}

/**
 * Creates an audit log entry in the database.
 *
 * @param params Audit log parameters
 * @returns Promise that resolves when the log is created
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        accountId: params.accountId,
        actorUserId: params.actorUserId,
        actorEmail: params.actorEmail,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        summary: params.summary,
        changesJson: params.changesJson ? JSON.stringify(params.changesJson) : null,
        isDeleted: false,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main operation
    console.error("Failed to create audit log", {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      actorUserId: params.actorUserId,
      actorEmail: params.actorEmail,
      accountId: params.accountId,
      error,
    });
  }
}

/**
 * Helper to get actor info from the current session.
 * You can expand this to fetch from the session/auth context.
 */
export interface ActorInfo {
  userId: string | null;
  email: string;
  name: string;
  role: string;
}
