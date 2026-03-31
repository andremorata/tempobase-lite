/**
 * Time Entries API Routes
 *
 * GET /api/time-entries - List with filters
 * POST /api/time-entries - Create manual entry
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withTenant } from "@/lib/db/extensions";
import { requireAuth, getCurrentTenantId, getCurrentUserId, getCurrentUser } from "@/lib/auth/helpers";
import { getMemberAccess, applyAccessFilter, isProjectAccessible, isTaskAccessible } from "@/lib/auth/access";
import { createAuditLog } from "@/lib/audit/logger";
import { mapTimeEntry } from "./mappers";

// ─── List Time Entries ────────────────────────────────────────────────────────

const ListQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  from: z.string().optional(), // ISO date string
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const currentUser = await getCurrentUser();
    const access = await getMemberAccess(currentUser.id, accountId, currentUser.role);

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = ListQuerySchema.parse(searchParams);

    const db = withTenant(prisma, accountId);

    const where: any = {
      accountId,
      isDeleted: false,
    };

    if (query.userId) {
      where.userId = query.userId;
    }

    // Apply project/task access restrictions (intersects with any caller-supplied filters)
    applyAccessFilter(where, access, query.projectId, query.taskId);

    if (query.from || query.to) {
      where.entryDate = {};
      if (query.from) {
        where.entryDate.gte = new Date(query.from);
      }
      if (query.to) {
        where.entryDate.lte = new Date(query.to);
      }
    }

    const entries = await db.timeEntry.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { entryDate: "desc" },
        { startTime: "desc" },
      ],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });

    // Return array directly to match frontend contract
    return NextResponse.json(entries.map(mapTimeEntry));
  } catch (error) {
    console.error("List time entries error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
}

// ─── Create Manual Time Entry ─────────────────────────────────────────────────

const CreateTimeEntrySchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  taskId: z.string().uuid().nullable().optional(),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isBillable: z.boolean().default(false),
  tagIds: z.array(z.string().uuid()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const user = await getCurrentUser();
    const userId = user.id;
    const access = await getMemberAccess(userId, accountId, user.role);

    const body = await request.json();
    const validated = CreateTimeEntrySchema.parse(body);

    // Enforce access restrictions on the selected project/task
    if (!isProjectAccessible(access, validated.projectId)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!isTaskAccessible(access, validated.taskId)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const startTime = new Date(validated.startTime);
    const endTime = new Date(validated.endTime);

    // Validation
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours > 24) {
      return NextResponse.json(
        { error: "Time entry cannot exceed 24 hours" },
        { status: 400 }
      );
    }

    const entryDate = new Date(startTime);
    entryDate.setHours(0, 0, 0, 0);

    // Create time entry in transaction
    const entry = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.timeEntry.create({
        data: {
          accountId,
          userId,
          projectId: validated.projectId ?? null,
          taskId: validated.taskId ?? null,
          description: validated.description?.trim() ?? null,
          entryDate,
          startTime,
          endTime,
          duration: durationMs,
          durationDecimal: Number(durationHours.toFixed(4)),
          isBillable: validated.isBillable,
          isRunning: false,
        },
      });

      // Associate tags if provided
      if (validated.tagIds && validated.tagIds.length > 0) {
        await tx.timeEntryTag.createMany({
          data: validated.tagIds.map((tagId) => ({
            timeEntryId: newEntry.id,
            tagId,
          })),
        });
      }

      // Fetch the entry with tags to return properly mapped response
      const entryWithTags = await tx.timeEntry.findUniqueOrThrow({
        where: { id: newEntry.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return entryWithTags;
    });

    // Create audit log
    await createAuditLog({
      accountId,
      actorUserId: userId,
      actorEmail: user.email ?? "",
      actorName: user.name ?? "",
      actorRole: user.role ?? "User",
      action: "create",
      entityType: "TimeEntry",
      entityId: entry.id,
      summary: `Created time entry: ${durationHours.toFixed(2)}h on ${entryDate.toISOString().split("T")[0]}`,
      changesJson: {
        projectId: entry.projectId,
        taskId: entry.taskId,
        description: entry.description,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        durationDecimal: entry.durationDecimal,
        isBillable: entry.isBillable,
      },
    });

    return NextResponse.json(mapTimeEntry(entry), { status: 201 });
  } catch (error) {
    console.error("Create time entry error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    );
  }
}
