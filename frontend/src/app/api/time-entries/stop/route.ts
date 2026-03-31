/**
 * Stop Timer Endpoint
 *
 * POST /api/time-entries/stop
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUser } from "@/lib/auth/helpers";
import { createAuditLog } from "@/lib/audit/logger";
import { summarizeTimeEntryAudit, toTimeEntryAuditSnapshot } from "../audit";
import { mapTimeEntry } from "../mappers";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const currentUser = await getCurrentUser();
    const userId = currentUser.id;

    // Find the running timer
    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        accountId,
        userId,
        isRunning: true,
        isDeleted: false,
      },
    });

    if (!runningTimer) {
      return NextResponse.json(
        { error: "No running timer found" },
        { status: 404 }
      );
    }

    // Calculate duration
    const now = new Date();
    const startTime = new Date(runningTimer.startTime);
    const durationMs = now.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Update the entry
    const stoppedEntry = await prisma.timeEntry.update({
      where: { id: runningTimer.id },
      data: {
        endTime: now,
        duration: durationMs,
        durationDecimal: Number(durationHours.toFixed(4)),
        isRunning: false,
        updatedAt: now,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    await createAuditLog({
      accountId,
      actorUserId: userId,
      actorEmail: currentUser.email ?? "",
      actorName: currentUser.name ?? "",
      actorRole: currentUser.role ?? "User",
      action: "stop",
      entityType: "TimeEntry",
      entityId: stoppedEntry.id,
      summary: summarizeTimeEntryAudit("stop", stoppedEntry),
      changesJson: toTimeEntryAuditSnapshot(stoppedEntry),
    });

    return NextResponse.json(mapTimeEntry(stoppedEntry));
  } catch (error) {
    console.error("Stop timer error:", error);

    return NextResponse.json(
      { error: "Failed to stop timer" },
      { status: 500 }
    );
  }
}
