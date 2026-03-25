/**
 * Shared Reports Endpoints
 *
 * GET /api/reports/shares - List all shared reports
 * POST /api/reports/shares - Create a new shared report link
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUserId } from "@/lib/auth/helpers";
import { toPersistedReportGroupBy } from "@/lib/reports/group-by";

const reportGroupBySchema = z.enum([
  "project",
  "client",
  "user",
  "task",
  "tag",
  "Project",
  "Client",
  "Task",
]);

const CreateSharedReportSchema = z.object({
  name: z.string().min(1).max(160),
  reportType: z.enum(["Summary", "Detailed", "Weekly"]),
  from: z.string().nullish(),
  to: z.string().nullish(),
  projectId: z.string().uuid().nullish(),
  clientId: z.string().uuid().nullish(),
  taskId: z.string().uuid().nullish(),
  tagId: z.string().uuid().nullish(),
  billable: z.boolean().nullish(),
  description: z.string().nullish(),
  groupBy: reportGroupBySchema.nullish(),
  showAmounts: z.boolean().default(false),
  expiresAt: z.string().nullish(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();

    const reports = await prisma.sharedReport.findMany({
      where: {
        accountId,
      },
      select: {
        id: true,
        name: true,
        token: true,
        reportType: true,
        filtersJson: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse filtersJson and extract from/to dates
    const reportsWithFilters = reports.map((report) => {
      let filters: any = {};
      try {
        filters = JSON.parse(report.filtersJson);
      } catch (error) {
        console.error("Failed to parse filters JSON:", error);
      }

      return {
        id: report.id,
        name: report.name || `${report.reportType} share`,
        token: report.token,
        reportType: report.reportType,
        from: filters.from || null,
        to: filters.to || null,
        expiresAt: report.expiresAt,
        createdAt: report.createdAt,
      };
    });

    return NextResponse.json(reportsWithFilters);
  } catch (error) {
    console.error("List shared reports error:", error);
    return NextResponse.json(
      { error: "Failed to list shared reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const userId = await getCurrentUserId();

    const body = await request.json();
    const validated = CreateSharedReportSchema.parse(body);
    const groupBy = toPersistedReportGroupBy(validated.groupBy);

    // Validate expiresAt if provided
    if (validated.expiresAt) {
      const expiresDate = new Date(validated.expiresAt);
      if (expiresDate <= new Date()) {
        return NextResponse.json(
          { error: "ExpiresAt must be in the future" },
          { status: 400 }
        );
      }
    }

    // Generate URL-safe token (18 bytes = 24 base64url chars)
    const tokenBytes = randomBytes(18);
    const token = tokenBytes
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

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
      groupBy,
      showAmounts: validated.showAmounts,
    });

    const report = await prisma.sharedReport.create({
      data: {
        accountId,
        createdByUserId: userId,
        name: validated.name,
        token,
        reportType: validated.reportType,
        filtersJson,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        token: true,
        reportType: true,
        filtersJson: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Parse filters back for response
    let filters: any = {};
    try {
      filters = JSON.parse(report.filtersJson);
    } catch (error) {
      console.error("Failed to parse filters JSON:", error);
    }

    return NextResponse.json(
      {
        id: report.id,
        name: report.name || `${report.reportType} share`,
        token: report.token,
        reportType: report.reportType,
        from: filters.from || null,
        to: filters.to || null,
        expiresAt: report.expiresAt,
        createdAt: report.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create shared report error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create shared report" },
      { status: 500 }
    );
  }
}
