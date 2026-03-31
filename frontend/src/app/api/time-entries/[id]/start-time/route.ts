/**
 * PATCH /api/time-entries/[id]/start-time - Adjust start time of a running timer
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUser } from "@/lib/auth/helpers";
import { getMemberAccess, isProjectAccessible } from "@/lib/auth/access";
import { mapTimeEntry } from "../../mappers";

const AdjustStartTimeSchema = z.object({
  startTime: z.string().datetime(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const currentUser = await getCurrentUser();
    const access = await getMemberAccess(currentUser.id, accountId, currentUser.role);
    const { id } = await params;

    const body = await request.json();
    const validated = AdjustStartTimeSchema.parse(body);

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Time entry not found" },
        { status: 404 }
      );
    }

    // Enforce access restrictions
    if (!isProjectAccessible(access, entry.projectId)) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 });
    }

    if (!entry.isRunning) {
      return NextResponse.json(
        { error: "Can only adjust start time of a running timer" },
        { status: 400 }
      );
    }

    const newStartTime = new Date(validated.startTime);

    if (newStartTime > new Date()) {
      return NextResponse.json(
        { error: "Start time cannot be in the future" },
        { status: 400 }
      );
    }

    const entryDate = new Date(newStartTime);
    entryDate.setHours(0, 0, 0, 0);

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        startTime: newStartTime,
        entryDate,
        updatedAt: new Date(),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(mapTimeEntry(updated));
  } catch (error) {
    console.error("Adjust start time error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to adjust start time" },
      { status: 500 }
    );
  }
}
