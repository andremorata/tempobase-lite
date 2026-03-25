/**
 * Team Member Management (Single)
 *
 * PUT /api/team/members/[id] - Update member role
 * DELETE /api/team/members/[id] - Remove member
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentTenantId, requireOwnerOrAdmin, getCurrentUserId } from "@/lib/auth/helpers";

const UpdateMemberRoleSchema = z.object({
  role: z.enum(["Owner", "Admin", "Manager", "Member", "Viewer"]),
});

// PUT /api/team/members/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwnerOrAdmin();
    const accountId = await getCurrentTenantId();
    const { id } = await params;

    const body = await request.json();
    const validated = UpdateMemberRoleSchema.parse(body);

    // Check if member exists and belongs to this account
    const member = await prisma.user.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Update role
    const updatedMember = await prisma.user.update({
      where: { id },
      data: {
        role: validated.role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Update member role error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/members/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwnerOrAdmin();
    const accountId = await getCurrentTenantId();
    const currentUserId = await getCurrentUserId();
    const { id } = await params;

    // Can't remove yourself
    if (id === currentUserId) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the workspace" },
        { status: 400 }
      );
    }

    // Check if member exists and belongs to this account
    const member = await prisma.user.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Soft delete the member
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
