/**
 * Public Shared Report Endpoint
 *
 * GET /api/public/reports/[token] - Get public shared report data (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { toNumber } from "@/lib/db/decimal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find shared report by token
    const shared = await prisma.sharedReport.findUnique({
      where: { token },
      select: {
        id: true,
        accountId: true,
        name: true,
        reportType: true,
        filtersJson: true,
        expiresAt: true,
      },
    });

    if (!shared) {
      return NextResponse.json(
        { error: "Shared report not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (shared.expiresAt && new Date(shared.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This shared report has expired" },
        { status: 410 } // Gone
      );
    }

    // Parse filters
    let filters: any = {};
    try {
      filters = JSON.parse(shared.filtersJson);
    } catch (error) {
      console.error("Failed to parse filters JSON:", error);
    }

    // Build base where clause
    const where: any = {
      accountId: shared.accountId,
      isRunning: false,
      isDeleted: false,
    };

    if (filters.from || filters.to) {
      where.entryDate = {};
      if (filters.from) {
        where.entryDate.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.entryDate.lte = new Date(filters.to);
      }
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.billable !== undefined && filters.billable !== null) {
      where.isBillable = filters.billable;
    }

    let data: any = null;

    if (shared.reportType === "Detailed") {
      // Detailed report
      const entries = await prisma.timeEntry.findMany({
        where,
        include: {
          project: {
            select: { name: true, color: true, hourlyRate: true },
          },
          task: {
            select: { name: true, hourlyRate: true },
          },
          tags: {
            include: {
              tag: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: [
          { entryDate: "desc" },
          { startTime: "desc" },
        ],
        take: 500,
      });

      const enrichedEntries = entries.map((entry) => {
        const hours = toNumber(entry.durationDecimal);
        const rate = toNumber(entry.task?.hourlyRate ?? entry.project?.hourlyRate);
        const billedAmount = entry.isBillable ? hours * rate : null;

        return {
          id: entry.id,
          projectName: entry.project?.name || null,
          projectColor: entry.project?.color || null,
          taskName: entry.task?.name || null,
          description: entry.description,
          entryDate: entry.entryDate,
          startTime: entry.startTime,
          endTime: entry.endTime,
          durationDecimal: hours,
          isBillable: entry.isBillable,
          billedAmount: filters.showAmounts ? billedAmount : null,
          tagNames: entry.tags.map((tt) => tt.tag.name),
        };
      });

      const totalHours = enrichedEntries.reduce((sum, e) => sum + e.durationDecimal, 0);
      const billableHours = enrichedEntries.filter(e => e.isBillable).reduce((sum, e) => sum + e.durationDecimal, 0);
      const totalBilled = enrichedEntries.reduce((sum, e) => sum + (e.billedAmount || 0), 0);

      data = {
        entries: enrichedEntries,
        totalHours: Number(totalHours.toFixed(2)),
        billableHours: Number(billableHours.toFixed(2)),
        totalBilledAmount: filters.showAmounts ? Number(totalBilled.toFixed(2)) : null,
        totalEntries: enrichedEntries.length,
      };
    } else if (shared.reportType === "Weekly") {
      // Weekly report
      const entries = await prisma.timeEntry.findMany({
        where,
        select: {
          entryDate: true,
          durationDecimal: true,
        },
      });

      if (entries.length === 0) {
        data = { weeks: [], grandTotal: 0 };
      } else {
        // Get Monday for a given date
        function getMonday(date: Date): string {
          const d = new Date(date);
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          d.setDate(d.getDate() + diff);
          return d.toISOString().split("T")[0];
        }

        const weekMap = new Map<string, Array<(typeof entries)[number]>>();

        for (const entry of entries) {
          const monday = getMonday(entry.entryDate);
          if (!weekMap.has(monday)) {
            weekMap.set(monday, []);
          }
          weekMap.get(monday)!.push(entry);
        }

        const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        const weeks = sortedWeeks.map(([mondayStr, weekEntries]) => {
          const weekStart = new Date(mondayStr);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const dayTotals = [0, 0, 0, 0, 0, 0, 0];

          for (const entry of weekEntries) {
            const entryDay = new Date(entry.entryDate).getDay();
            const dayIndex = entryDay === 0 ? 6 : entryDay - 1;
            dayTotals[dayIndex] += toNumber(entry.durationDecimal);
          }

          const weekTotal = dayTotals.reduce((sum, hours) => sum + hours, 0);

          return {
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: weekEnd.toISOString().split("T")[0],
            dayTotals: dayTotals.map(h => Number(h.toFixed(2))),
            weekTotal: Number(weekTotal.toFixed(2)),
          };
        });

        const grandTotal = weeks.reduce((sum, w) => sum + w.weekTotal, 0);

        data = {
          weeks,
          grandTotal: Number(grandTotal.toFixed(2)),
        };
      }
    } else {
      // Summary report — return both aggregated totals and individual entries
      const entries = await prisma.timeEntry.findMany({
        where,
        include: {
          project: {
            select: { name: true, color: true, hourlyRate: true },
          },
          task: {
            select: { name: true, hourlyRate: true },
          },
          tags: {
            include: { tag: { select: { name: true } } },
          },
        },
        orderBy: [{ entryDate: "desc" }, { startTime: "desc" }],
        take: 500,
      });

      const enrichedEntries = entries.map((entry) => {
        const hours = toNumber(entry.durationDecimal);
        const rate = toNumber(entry.task?.hourlyRate ?? entry.project?.hourlyRate);
        const billedAmount = entry.isBillable && filters.showAmounts ? hours * rate : null;
        return {
          id: entry.id,
          projectName: entry.project?.name || null,
          projectColor: entry.project?.color || null,
          taskName: entry.task?.name || null,
          description: entry.description,
          entryDate: entry.entryDate.toISOString().split("T")[0],
          startTime: entry.startTime,
          endTime: entry.endTime,
          durationDecimal: hours,
          isBillable: entry.isBillable,
          billedAmount,
          tagNames: entry.tags.map((tt) => tt.tag.name),
        };
      });

      const totalHours = enrichedEntries.reduce((s, e) => s + e.durationDecimal, 0);
      const billableHours = enrichedEntries.filter((e) => e.isBillable).reduce((s, e) => s + e.durationDecimal, 0);
      const totalBilledAmount = enrichedEntries.reduce((s, e) => s + (e.billedAmount ?? 0), 0);

      data = {
        summary: {
          groups: [],
          totalHours: Number(totalHours.toFixed(2)),
          billableHours: Number(billableHours.toFixed(2)),
          totalBilledAmount: filters.showAmounts ? Number(totalBilledAmount.toFixed(2)) : 0,
          totalEntries: enrichedEntries.length,
        },
        entries: enrichedEntries,
      };
    }

    return NextResponse.json({
      name: shared.name || `${shared.reportType} share`,
      reportType: shared.reportType,
      from: filters.from || null,
      to: filters.to || null,
      showAmounts: filters.showAmounts || false,
      data,
    });
  } catch (error) {
    console.error("Get public shared report error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve shared report" },
      { status: 500 }
    );
  }
}
