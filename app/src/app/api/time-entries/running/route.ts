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
        task: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Return null directly when no timer is running (frontend expects TimeEntry | null)
    if (!runningTimer) {
      return NextResponse.json(null);
    }

    // NOTE: This GET doubles as the presence heartbeat. The client polls it every 30s while the
    // app is visible, so `lastSeenAt` tracks "the app was still open at this moment" for free.
    // The response is mapped BEFORE the write on purpose: callers need the *previous* heartbeat
    // to know when the app was last open, which is what stale-timer recovery offers as a stop time.
    const response = mapTimeEntry(runningTimer);

    await prisma.timeEntry.update({
      where: { id: runningTimer.id },
      // Deliberately not touching updatedAt — a heartbeat is not a user edit.
      data: { lastSeenAt: new Date() },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get running timer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch running timer" },
      { status: 500 }
    );
  }
}
