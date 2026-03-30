/**
 * Team Members Endpoints
 *
 * GET /api/team/members - List all team members
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId } from "@/lib/auth/helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accountId = await getCurrentTenantId();

    const members = await prisma.user.findMany({
      where: {
        accountId,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        canViewAmounts: true,
        createdAt: true,
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("List team members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
