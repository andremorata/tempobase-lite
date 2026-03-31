/**
 * Bulk Time Entry Delete Operation
 *
 * POST /api/time-entries/bulk-delete - Bulk soft delete (matches frontend contract)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, getCurrentUser } from "@/lib/auth/helpers";
import { getMemberAccess } from "@/lib/auth/access";

const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const currentUser = await getCurrentUser();
    const access = await getMemberAccess(currentUser.id, accountId, currentUser.role);

    const body = await request.json();
    const validated = BulkDeleteSchema.parse(body);

    // Build the where clause — restrict to accessible projects if the user is scoped
    const where: any = {
      id: { in: validated.ids },
      accountId,
      isDeleted: false,
    };
    if (access.projectIds !== null) {
      where.projectId = { in: access.projectIds };
    }

    // Soft delete all entries
    const result = await prisma.timeEntry.updateMany({
      where,
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    // Return 204 No Content for successful delete operations
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Bulk delete error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete time entries" },
      { status: 500 }
    );
  }
}
