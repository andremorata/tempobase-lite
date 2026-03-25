/**
 * Tasks API Routes (within projects)
 *
 * GET /api/projects/[id]/tasks - List tasks for a project
 * POST /api/projects/[id]/tasks - Create task
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { toNumber } from "@/lib/db/decimal";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

// ─── List Tasks ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id: projectId } = await params;

    // Verify project exists and belongs to this account
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        accountId,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const tasks = await prisma.projectTask.findMany({
      where: {
        projectId,
        isDeleted: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      tasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        name: t.name,
        isActive: t.isActive,
        hourlyRate: t.hourlyRate === null ? null : toNumber(t.hourlyRate),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (error) {
    console.error("List tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// ─── Create Task ──────────────────────────────────────────────────────────

const CreateTaskSchema = z.object({
  name: z.string().min(1).max(200),
  hourlyRate: z.number().min(0).nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id: projectId } = await params;

    // Verify project exists and belongs to this account
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        accountId,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = CreateTaskSchema.parse(body);

    const task = await prisma.projectTask.create({
      data: {
        accountId,
        projectId,
        name: validated.name,
        hourlyRate: validated.hourlyRate ?? null,
      },
    });

    return NextResponse.json(
      {
        id: task.id,
        projectId: task.projectId,
        name: task.name,
        isActive: task.isActive,
        hourlyRate: task.hourlyRate === null ? null : toNumber(task.hourlyRate),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
