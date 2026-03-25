/**
 * Get Running Timer Endpoint
 *
 * GET /api/time-entries/running
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUserId } from "@/lib/auth/helpers";
import { mapTimeEntry } from "../mappers";

export async function GET() {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const userId = await getCurrentUserId();

    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        accountId,
        userId,
        isRunning: true,
        isDeleted: false,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Return null directly when no timer is running (frontend expects TimeEntry | null)
    if (!runningTimer) {
      return NextResponse.json(null);
    }

    return NextResponse.json(mapTimeEntry(runningTimer));
  } catch (error) {
    console.error("Get running timer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch running timer" },
      { status: 500 }
    );
  }
}
