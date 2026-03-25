/**
 * Purge Time Entries Endpoint
 *
 * POST /api/account/purge/time-entries - Delete time entries within date range (Owner/Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, requireOwnerOrAdmin } from "@/lib/auth/helpers";

const PurgeTimeEntriesSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireOwnerOrAdmin();
    const accountId = await getCurrentTenantId();

    const body = await request.json();
    const validated = PurgeTimeEntriesSchema.parse(body);

    const where: any = {
      accountId,
      isDeleted: false,
    };

    if (validated.from || validated.to) {
      where.entryDate = {};
      if (validated.from) {
        where.entryDate.gte = new Date(validated.from);
      }
      if (validated.to) {
        where.entryDate.lte = new Date(validated.to);
      }
    }

    // Soft delete time entries
    const result = await prisma.timeEntry.updateMany({
      where,
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      purgedCount: result.count,
      from: validated.from || null,
      to: validated.to || null,
      purgedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Purge time entries error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to purge time entries" },
      { status: 500 }
    );
  }
}
