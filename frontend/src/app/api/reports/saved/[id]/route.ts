/**
 * Saved Report (Single) Endpoints
 *
 * PUT /api/reports/saved/[id] - Update a saved report
 * DELETE /api/reports/saved/[id] - Delete a saved report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

const UpdateSavedReportSchema = z.object({
  name: z.string().min(1).max(200),
  reportType: z.enum(["Summary", "Detailed", "Weekly"]),
  from: z.string().nullish(),
  to: z.string().nullish(),
  projectId: z.string().uuid().nullish(),
  clientId: z.string().uuid().nullish(),
  taskId: z.string().uuid().nullish(),
  tagId: z.string().uuid().nullish(),
  billable: z.boolean().nullish(),
  description: z.string().nullish(),
  groupBy: z.enum(["project", "client", "user", "task", "tag"]).nullish(),
  preset: z.string().nullish(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    const body = await request.json();
    const validated = UpdateSavedReportSchema.parse(body);

    // Check if report exists
    const existingReport = await prisma.savedReport.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!existingReport || existingReport.accountId !== accountId) {
      return NextResponse.json(
        { error: "Saved report not found" },
        { status: 404 }
      );
    }

    // Serialize filters to JSON
    const filtersJson = JSON.stringify({
      from: validated.from,
      to: validated.to,
      projectId: validated.projectId,
      clientId: validated.clientId,
      taskId: validated.taskId,
      tagId: validated.tagId,
      billable: validated.billable,
      description: validated.description,
      groupBy: validated.groupBy || "project",
      preset: validated.preset ?? "custom",
    });

    const report = await prisma.savedReport.update({
      where: { id },
      data: {
        name: validated.name,
        reportType: validated.reportType,
        filtersJson,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        reportType: true,
        filtersJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse filters back for response
    let filters: any = {};
    try {
      filters = JSON.parse(report.filtersJson);
    } catch (error) {
      console.error("Failed to parse filters JSON:", error);
    }

    return NextResponse.json({
      id: report.id,
      name: report.name,
      reportType: report.reportType,
      from: filters.from || null,
      to: filters.to || null,
      projectId: filters.projectId || null,
      clientId: filters.clientId || null,
      taskId: filters.taskId || null,
      tagId: filters.tagId || null,
      billable: filters.billable ?? null,
      description: filters.description || null,
      groupBy: filters.groupBy || "project",
      preset: filters.preset || "custom",
      createdAt: report.createdAt,
      updatedAt: report.updatedAt || report.createdAt,
    });
  } catch (error) {
    console.error("Update saved report error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update saved report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    // Check if report exists
    const existingReport = await prisma.savedReport.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!existingReport || existingReport.accountId !== accountId) {
      return NextResponse.json(
        { error: "Saved report not found" },
        { status: 404 }
      );
    }

    // Hard delete saved reports (they're user preferences, not business data)
    await prisma.savedReport.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Delete saved report error:", error);
    return NextResponse.json(
      { error: "Failed to delete saved report" },
      { status: 500 }
    );
  }
}
