import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getCurrentTenantId: vi.fn(),
  getCurrentUser: vi.fn(),
  getCurrentUserId: vi.fn(),
}));

const auditMock = vi.hoisted(() => ({
  createAuditLog: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  prisma: {
    timeEntry: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/helpers", () => authMock);
vi.mock("@/lib/audit/logger", () => auditMock);
vi.mock("@/lib/db/prisma", () => prismaMock);

import { POST as stopTimer } from "../stop/route";

const START_TIME = new Date("2026-03-30T18:00:00.000Z");

function buildRunningEntry() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    projectId: null,
    taskId: null,
    description: "Overnight work",
    entryDate: new Date("2026-03-30T00:00:00.000Z"),
    startTime: START_TIME,
    endTime: null,
    duration: null,
    durationDecimal: null,
    isBillable: true,
    isRunning: true,
    lastSeenAt: new Date("2026-03-31T09:00:00.000Z"),
    lastSessionEndAt: new Date("2026-03-30T18:47:00.000Z"),
    createdAt: START_TIME,
    updatedAt: null,
    isDeleted: false,
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    importSessionId: null,
    tags: [],
    project: null,
  };
}

function stopRequest(body?: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/time-entries/stop", {
    method: "POST",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("POST /api/time-entries/stop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date("2026-03-31T09:00:00.000Z"));

    authMock.requireAuth.mockResolvedValue(undefined);
    authMock.getCurrentTenantId.mockResolvedValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    authMock.getCurrentUser.mockResolvedValue({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      email: "user@example.com",
      name: "Test User",
      role: "Admin",
    });

    const entry = buildRunningEntry();
    prismaMock.prisma.timeEntry.findFirst.mockResolvedValue(entry);
    prismaMock.prisma.timeEntry.update.mockResolvedValue({
      ...entry,
      isRunning: false,
      endTime: new Date("2026-03-30T18:47:00.000Z"),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stops at the current time when no endTime is supplied", async () => {
    const response = await stopTimer(stopRequest());

    expect(response.status).toBe(200);
    expect(prismaMock.prisma.timeEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          endTime: new Date("2026-03-31T09:00:00.000Z"),
          isRunning: false,
        }),
      }),
    );
  });

  it("stops at the supplied endTime and derives the duration from it", async () => {
    const response = await stopTimer(
      stopRequest({ endTime: "2026-03-30T18:47:00.000Z" }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.prisma.timeEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          endTime: new Date("2026-03-30T18:47:00.000Z"),
          duration: 47 * 60 * 1000,
          durationDecimal: 0.7833,
        }),
      }),
    );
  });

  it("rejects an endTime in the future", async () => {
    const response = await stopTimer(
      stopRequest({ endTime: "2026-04-01T09:00:00.000Z" }),
    );

    expect(response.status).toBe(400);
    expect(prismaMock.prisma.timeEntry.update).not.toHaveBeenCalled();
  });

  it("rejects an endTime at or before the start time", async () => {
    const response = await stopTimer(
      stopRequest({ endTime: START_TIME.toISOString() }),
    );

    expect(response.status).toBe(400);
    expect(prismaMock.prisma.timeEntry.update).not.toHaveBeenCalled();
  });
});
