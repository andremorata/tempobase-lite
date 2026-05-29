/**
 * Shared Report (Single) Endpoint
 *
 * DELETE /api/reports/shares/[id] - Delete a shared report
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    // Check if report exists
    const existingReport = await prisma.sharedReport.findUnique({
      where: { id },
      select: { accountId: true },
    });

    if (!existingReport || existingReport.accountId !== accountId) {
      return NextResponse.json(
        { error: "Shared report not found" },
        { status: 404 }
      );
    }

    // Hard delete for public shares
    await prisma.sharedReport.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Delete shared report error:", error);
    return NextResponse.json(
      { error: "Failed to delete shared report" },
      { status: 500 }
    );
  }
}
