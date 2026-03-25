/**
 * Auth.js Helper Functions
 *
 * Utilities for authentication and authorization in Next.js API routes.
 */

import { auth } from "./config";
import type { UserRole } from "@prisma/client";

/**
 * Get current session or throw 401
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    throw new AuthError(401, "Unauthorized");
  }

  return session;
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new AuthError(403, "Forbidden");
  }

  return session;
}

/**
 * Get current tenant (account) ID from session
 */
export async function getCurrentTenantId(): Promise<string> {
  const session = await requireAuth();
  return session.user.accountId;
}

/**
 * Get current user ID from session
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}

/**
 * Get full session user
 */
export async function getCurrentUser() {
  const session = await requireAuth();
  return session.user;
}

/**
 * Check if user is owner or admin
 */
export async function requireOwnerOrAdmin() {
  return requireRole(["Owner", "Admin"]);
}

/**
 * Check if user is owner
 */
export async function requireOwner() {
  return requireRole(["Owner"]);
}

/**
 * Auth error class
 */
export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
