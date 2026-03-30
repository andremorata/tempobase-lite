/**
 * User Profile Endpoints
 *
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update current user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getCurrentUserId } from "@/lib/auth/helpers";

// ─── Get Current User Profile ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const userId = await getCurrentUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dateFormat: true,
        defaultProjectId: true,
        showAuditMetadata: true,
        canViewAmounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// ─── Update Current User Profile ──────────────────────────────────────────

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateFormat: z.string().min(1).max(50),
  defaultProjectId: z.string().uuid().nullable().optional(),
  showAuditMetadata: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const userId = await getCurrentUserId();

    const body = await request.json();
    const validated = UpdateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        dateFormat: validated.dateFormat,
        defaultProjectId: validated.defaultProjectId === undefined ? undefined : validated.defaultProjectId,
        showAuditMetadata: validated.showAuditMetadata,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dateFormat: true,
        defaultProjectId: true,
        showAuditMetadata: true,
        canViewAmounts: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
