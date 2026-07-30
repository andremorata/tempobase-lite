import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getCurrentTenantId: vi.fn(),
  getCurrentUserId: vi.fn(),
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
vi.mock("@/lib/db/prisma", () => prismaMock);

import { GET as getRunning } from "../running/route";

const NOW = new Date("2026-03-31T09:00:00.000Z");

function buildRunningEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    projectId: null,
    taskId: null,
    description: "Overnight work",
    entryDate: new Date("2026-03-30T00:00:00.000Z"),
    startTime: new Date("2026-03-30T14:00:00.000Z"),
    endTime: null,
    duration: null,
    durationDecimal: null,
    isBillable: true,
    isRunning: true,
    lastSeenAt: null,
    lastSessionEndAt: null,
    createdAt: new Date("2026-03-30T14:00:00.000Z"),
    updatedAt: null,
    isDeleted: false,
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    importSessionId: null,
    tags: [],
    project: null,
    ...overrides,
  };
}

function updatedData() {
  return prismaMock.prisma.timeEntry.update.mock.calls[0][0].data;
}

describe("GET /api/time-entries/running", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(NOW);

    authMock.requireAuth.mockResolvedValue(undefined);
    authMock.getCurrentTenantId.mockResolvedValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    authMock.getCurrentUserId.mockResolvedValue("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    prismaMock.prisma.timeEntry.update.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records where the previous session ended when the heartbeat has a long gap", async () => {
    const lastSeenAt = new Date("2026-03-30T18:47:00.000Z");
    prismaMock.prisma.timeEntry.findFirst.mockResolvedValue(buildRunningEntry({ lastSeenAt }));

    const body = await (await getRunning()).json();

    expect(updatedData()).toEqual({ lastSeenAt: NOW, lastSessionEndAt: lastSeenAt });
    expect(body.lastSessionEndAt).toBe(lastSeenAt.toISOString());
  });

  it("keeps the recorded session end while the app keeps polling", async () => {
    // The regression this guards: a poll 30s later must not move the recovery point to "now"
    const lastSessionEndAt = new Date("2026-03-30T18:47:00.000Z");
    prismaMock.prisma.timeEntry.findFirst.mockResolvedValue(
      buildRunningEntry({ lastSeenAt: new Date(NOW.getTime() - 30_000), lastSessionEndAt })
    );

    const body = await (await getRunning()).json();

    expect(updatedData()).toEqual({ lastSeenAt: NOW });
    expect(body.lastSessionEndAt).toBe(lastSessionEndAt.toISOString());
  });

  it("only heartbeats when there is no previous heartbeat to compare against", async () => {
    prismaMock.prisma.timeEntry.findFirst.mockResolvedValue(buildRunningEntry());

    const body = await (await getRunning()).json();

    expect(updatedData()).toEqual({ lastSeenAt: NOW });
    expect(body.lastSessionEndAt).toBeNull();
  });

  it("returns null and writes nothing when no timer is running", async () => {
    prismaMock.prisma.timeEntry.findFirst.mockResolvedValue(null);

    const body = await (await getRunning()).json();

    expect(body).toBeNull();
    expect(prismaMock.prisma.timeEntry.update).not.toHaveBeenCalled();
  });
});
