/**
 * Execute Import Endpoint
 *
 * POST /api/imports/time-entries/execute - Create time entries from parsed rows
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUserId } from "@/lib/auth/helpers";

const ImportRowSchema = z.object({
  rowIndex: z.number().int(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().nullable().optional(),
  isBillable: z.boolean(),
  projectId: z.string().uuid().nullable().optional(),
  taskId: z.string().uuid().nullable().optional(),
  include: z.boolean(),
});

const ExecuteImportSchema = z.object({
  rows: z.array(ImportRowSchema).min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const userId = await getCurrentUserId();

    const body = await request.json();
    const validated = ExecuteImportSchema.parse(body);

    let imported = 0;
    let skipped = 0;
    const errors: { rowIndex: number; message: string }[] = [];

    // Process each row
    for (const row of validated.rows) {
      if (!row.include) {
        skipped++;
        continue;
      }

      try {
        const startTime = new Date(row.startTime);
        const endTime = new Date(row.endTime);

        // Validate time range
        if (endTime <= startTime) {
          errors.push({ rowIndex: row.rowIndex, message: "End time must be after start time." });
          continue;
        }

        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours > 24) {
          errors.push({ rowIndex: row.rowIndex, message: "Entry duration exceeds 24 hours." });
          continue;
        }

        const durationDecimal = Math.round(durationHours * 10000) / 10000;

        // Extract entry date (date part of startTime in UTC)
        const entryDate = new Date(
          Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate())
        );

        // Create time entry
        await prisma.timeEntry.create({
          data: {
            accountId,
            userId,
            projectId: row.projectId || null,
            taskId: row.taskId || null,
            description: row.description || null,
            entryDate,
            startTime,
            endTime,
            duration: durationMs,
            durationDecimal,
            isBillable: row.isBillable,
            isRunning: false,
            isDeleted: false,
          },
        });

        imported++;
      } catch (error: any) {
        console.error(`Import row ${row.rowIndex} error:`, error);
        errors.push({
          rowIndex: row.rowIndex,
          message: error.message || "Failed to create time entry",
        });
      }
    }

    return NextResponse.json({
      importedCount: imported,
      skippedCount: skipped,
      errors,
    });
  } catch (error) {
    console.error("Execute import error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to execute import" },
      { status: 500 }
    );
  }
}
