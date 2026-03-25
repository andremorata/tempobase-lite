/**
 * Summary Report Endpoint
 *
 * GET /api/reports/summary - Get aggregated time summary
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { toNumber } from "@/lib/db/decimal";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

const QuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  billable: z.enum(["true", "false"]).optional(),
  groupBy: z.enum(["Project", "Client", "Task"]).default("Project"),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = QuerySchema.parse(searchParams);

    const where: any = {
      accountId,
      isRunning: false,
      isDeleted: false,
    };

    if (query.from || query.to) {
      where.entryDate = {};
      if (query.from) {
        where.entryDate.gte = new Date(query.from);
      }
      if (query.to) {
        where.entryDate.lte = new Date(query.to);
      }
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.clientId) {
      where.project = {
        clientId: query.clientId,
      };
    }

    if (query.taskId) {
      where.taskId = query.taskId;
    }

    if (query.tagId) {
      where.tags = {
        some: {
          tagId: query.tagId,
        },
      };
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.billable === "true") {
      where.isBillable = true;
    } else if (query.billable === "false") {
      where.isBillable = false;
    }

    // Fetch entries based on group by
    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            hourlyRate: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            hourlyRate: true,
          },
        },
      },
    });

    // Group and aggregate
    const groups = new Map<string, any>();

    for (const entry of entries) {
      let groupKey = "";
      let groupName = "";
      let color: string | null = null;

      switch (query.groupBy) {
        case "Project":
          groupKey = entry.projectId || "no-project";
          groupName = entry.project?.name || "No Project";
          color = entry.project?.color || null;
          break;
        case "Client":
          groupKey = entry.project?.client?.id || "no-client";
          groupName = entry.project?.client?.name || "No Client";
          break;
        case "Task":
          groupKey = entry.taskId || "no-task";
          groupName = entry.task?.name || "No Task";
          break;
        default:
          groupKey = entry.projectId || "no-project";
          groupName = entry.project?.name || "No Project";
          color = entry.project?.color || null;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          groupId: groupKey,
          groupName,
          color,
          totalHours: 0,
          billableHours: 0,
          billedAmount: 0,
          entryCount: 0,
        });
      }

      const group = groups.get(groupKey);
      const hours = toNumber(entry.durationDecimal);

      group.totalHours += hours;
      group.entryCount += 1;

      if (entry.isBillable) {
        group.billableHours += hours;
        // Calculate billed amount using task rate > project rate
        const rate = entry.task?.hourlyRate ?? entry.project?.hourlyRate;
        group.billedAmount += hours * toNumber(rate);
      }
    }

    const summary = Array.from(groups.values())
      .map((g) => ({
        groupId: g.groupId,
        groupName: g.groupName,
        color: g.color,
        totalHours: Number(g.totalHours.toFixed(2)),
        billableHours: Number(g.billableHours.toFixed(2)),
        billedAmount: Number(g.billedAmount.toFixed(2)),
        entryCount: g.entryCount,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    const totals = summary.reduce(
      (acc, g) => ({
        totalHours: acc.totalHours + g.totalHours,
        billableHours: acc.billableHours + g.billableHours,
        totalBilledAmount: acc.totalBilledAmount + g.billedAmount,
        entryCount: acc.entryCount + g.entryCount,
      }),
      { totalHours: 0, billableHours: 0, totalBilledAmount: 0, entryCount: 0 }
    );

    // Match SummaryReportResponse interface
    return NextResponse.json({
      groups: summary,
      totalHours: Number(totals.totalHours.toFixed(2)),
      billableHours: Number(totals.billableHours.toFixed(2)),
      totalBilledAmount: Number(totals.totalBilledAmount.toFixed(2)),
      totalEntries: totals.entryCount,
    });
  } catch (error) {
    console.error("Summary report error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate summary report" },
      { status: 500 }
    );
  }
}
