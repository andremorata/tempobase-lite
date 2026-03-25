/**
 * Project Operations (Single)
 *
 * GET /api/projects/[id] - Get single project
 * PUT /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Soft delete project
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { toNumber } from "@/lib/db/decimal";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  color: z.string().max(20).nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  status: z.enum(["Active", "Archived", "Completed"]).optional(),
  billingType: z.enum(["Hourly", "Fixed", "NonBillable"]).optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  budgetHours: z.number().min(0).nullable().optional(),
});

// GET /api/projects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            name: true,
            hourlyRate: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: project.id,
      accountId: project.accountId,
      clientId: project.clientId,
      name: project.name,
      color: project.color,
      status: project.status,
      billingType: project.billingType,
      hourlyRate: project.hourlyRate === null ? null : toNumber(project.hourlyRate),
      budgetHours: project.budgetHours === null ? null : toNumber(project.budgetHours),
      isArchived: project.status === "Archived",
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      client: project.client,
      tasks: project.tasks.map((task) => ({
        ...task,
        hourlyRate: task.hourlyRate === null ? null : toNumber(task.hourlyRate),
      })),
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    const body = await request.json();
    const validated = UpdateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validated.name !== undefined) {
      updateData.name = validated.name;
    }
    if (validated.color !== undefined) {
      updateData.color = validated.color;
    }
    if (validated.clientId !== undefined) {
      updateData.clientId = validated.clientId;
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
    }
    if (validated.billingType !== undefined) {
      updateData.billingType = validated.billingType;
    }
    if (validated.hourlyRate !== undefined) {
      updateData.hourlyRate = validated.hourlyRate;
    }
    if (validated.budgetHours !== undefined) {
      updateData.budgetHours = validated.budgetHours;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            name: true,
            hourlyRate: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: project.id,
      accountId: project.accountId,
      clientId: project.clientId,
      name: project.name,
      color: project.color,
      status: project.status,
      billingType: project.billingType,
      hourlyRate: project.hourlyRate === null ? null : toNumber(project.hourlyRate),
      budgetHours: project.budgetHours === null ? null : toNumber(project.budgetHours),
      isArchived: project.status === "Archived",
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      client: project.client,
      tasks: project.tasks.map((task) => ({
        ...task,
        hourlyRate: task.hourlyRate === null ? null : toNumber(task.hourlyRate),
      })),
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    // Check if project exists
    const project = await prisma.project.findFirst({
      where: {
        id,
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

    // Soft delete
    await prisma.project.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
