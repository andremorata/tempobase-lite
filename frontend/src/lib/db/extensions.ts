/**
 * Multi-tenancy and Soft Delete Extensions
 *
 * Provides automatic tenant scoping and soft-delete filtering for all queries.
 * Mirrors the behavior of EF Core's global query filters.
 */

import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Tenant-scoped Prisma client extension
 *
 * Auto-injects accountId filter into all queries for multi-tenant isolation.
 * Excludes soft-deleted records (isDeleted = false) automatically.
 *
 * Usage:
 * ```ts
 * const db = prisma.withTenant(accountId);
 * const projects = await db.project.findMany(); // auto-filtered by accountId
 * ```
 */
export function withTenant(prisma: PrismaClient, accountId: string) {
  return prisma.$extends({
    query: {
      // Account model (no tenant filter on itself, but soft-delete applies)
      account: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // User - tenant + soft-delete
      user: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // AccountInvite - tenant + soft-delete
      accountInvite: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // Client - tenant + soft-delete
      client: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // Project - tenant + soft-delete
      project: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // ProjectTask - tenant + soft-delete
      projectTask: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // TimeEntry - tenant + soft-delete
      timeEntry: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // Tag - tenant + soft-delete
      tag: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },

      // SavedReport - tenant
      savedReport: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
      },

      // SharedReport - tenant
      sharedReport: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
          };
          return query(args);
        },
      },

      // AuditLog - tenant + soft-delete
      auditLog: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = {
            ...args.where,
            accountId,
            isDeleted: false,
          };
          return query(args);
        },
      },
    },
  });
}

/**
 * Soft-delete helper functions
 */
export async function softDelete<T extends { isDeleted: boolean; deletedAt: Date | null }>(
  record: T
): Promise<T> {
  return {
    ...record,
    isDeleted: true,
    deletedAt: new Date(),
  };
}

export async function restore<T extends { isDeleted: boolean; deletedAt: Date | null }>(
  record: T
): Promise<T> {
  return {
    ...record,
    isDeleted: false,
    deletedAt: null,
  };
}
