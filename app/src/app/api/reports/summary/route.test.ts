import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

type MockPrismaWhere = { [key: string]: unknown };

vi.mock("@/lib/auth/helpers", () => ({
  requireAuth: vi.fn(() => Promise.resolve()),
  getCurrentTenantId: vi.fn(() => Promise.resolve("acct-1")),
  getCurrentUser: vi.fn(() => Promise.resolve({ id: "user-1", role: "admin" })),
}));

vi.mock("@/lib/auth/access", () => ({
  getMemberAccess: vi.fn(() => Promise.resolve({})),
  applyAccessFilter: vi.fn((where: MockPrismaWhere) => where),
}));

vi.mock("@/lib/db/prisma", () => {
  const findMany = vi.fn();
  const findUnique = vi.fn(() => Promise.resolve({ canViewAmounts: true }));

  return {
    prisma: {
      user: {
        findUnique,
      },
      timeEntry: {
        findMany,
      },
    },
    __esModule: true,
  };
});

import { prisma } from "@/lib/db/prisma";
import { GET } from "./route";

describe("Summary report route", () => {
  const mockedPrisma = vi.mocked(prisma, true);

  beforeEach(() => {
    mockedPrisma.timeEntry.findMany.mockReset();
    mockedPrisma.user.findUnique.mockReset();
    mockedPrisma.user.findUnique.mockResolvedValue({
      canViewAmounts: true,
    } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);
    mockedPrisma.timeEntry.findMany.mockResolvedValue([]);
  });

  it("applies the description search filter to summary report queries", async () => {
    const request = {
      nextUrl: new URL("http://localhost/api/reports/summary?description=review"),
    } as unknown as NextRequest;

    await GET(request);

    expect(mockedPrisma.timeEntry.findMany).toHaveBeenCalled();
    const callArg = mockedPrisma.timeEntry.findMany.mock.calls[0]![0]!;
    expect(callArg.where).toBeDefined();
    expect(callArg.where!.description).toEqual({ contains: "review", mode: "insensitive" });
  });
});
