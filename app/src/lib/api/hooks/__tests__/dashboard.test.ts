import { describe, it, expect } from "vitest";
import type { DashboardResponse, DashboardKpis, DayHoursRow, ProjectHoursRow, RecentEntryRow } from "@/lib/api/types";

// ─── Dashboard type shape tests ───────────────────────────────────────────────

describe("DashboardKpis", () => {
  it("has correct shape", () => {
    const kpis: DashboardKpis = {
      totalHoursThisWeek: 32.5,
      totalHoursToday: 3.5,
      activeProjectsCount: 4,
      billablePercentage: 75.0,
    };
    expect(kpis.totalHoursThisWeek).toBe(32.5);
    expect(kpis.totalHoursToday).toBe(3.5);
    expect(kpis.activeProjectsCount).toBe(4);
    expect(kpis.billablePercentage).toBe(75.0);
  });

  it("allows zero values", () => {
    const kpis: DashboardKpis = {
      totalHoursThisWeek: 0,
      totalHoursToday: 0,
      activeProjectsCount: 0,
      billablePercentage: 0,
    };
    expect(kpis.totalHoursThisWeek).toBe(0);
    expect(kpis.billablePercentage).toBe(0);
  });
});

describe("DayHoursRow", () => {
  it("has correct shape with 7-day range", () => {
    const rows: DayHoursRow[] = [
      { date: "2026-03-16", totalHours: 6.5 },
      { date: "2026-03-17", totalHours: 0 },
      { date: "2026-03-18", totalHours: 4 },
      { date: "2026-03-19", totalHours: 7.5 },
      { date: "2026-03-20", totalHours: 3 },
      { date: "2026-03-21", totalHours: 8 },
      { date: "2026-03-22", totalHours: 3.5 },
    ];
    expect(rows).toHaveLength(7);
    expect(rows[0]?.date).toBe("2026-03-16");
    expect(rows.reduce((s, r) => s + r.totalHours, 0)).toBe(32.5);
  });
});

describe("ProjectHoursRow", () => {
  it("accepts optional color", () => {
    const row: ProjectHoursRow = {
      projectId: "proj-1",
      projectName: "Website Redesign",
      projectColor: "#10b981",
      totalHours: 12,
    };
    expect(row.projectColor).toBe("#10b981");
  });

  it("accepts null color", () => {
    const row: ProjectHoursRow = {
      projectId: "proj-2",
      projectName: "No Color Project",
      projectColor: null,
      totalHours: 5,
    };
    expect(row.projectColor).toBeNull();
  });
});

describe("RecentEntryRow", () => {
  it("represents a completed entry", () => {
    const entry: RecentEntryRow = {
      id: "entry-1",
      description: "Design review",
      projectName: "Website Redesign",
      projectColor: "#10b981",
      entryDate: "2026-03-22",
      startTime: "2026-03-22T09:00:00Z",
      endTime: "2026-03-22T11:30:00Z",
      durationDecimal: 2.5,
      isRunning: false,
    };
    expect(entry.isRunning).toBe(false);
    expect(entry.durationDecimal).toBe(2.5);
  });

  it("represents a running entry", () => {
    const entry: RecentEntryRow = {
      id: "entry-2",
      description: null,
      projectName: null,
      projectColor: null,
      entryDate: "2026-03-22",
      startTime: "2026-03-22T14:00:00Z",
      endTime: null,
      durationDecimal: null,
      isRunning: true,
    };
    expect(entry.isRunning).toBe(true);
    expect(entry.endTime).toBeNull();
    expect(entry.description).toBeNull();
  });
});

describe("DashboardResponse", () => {
  it("has correct full shape", () => {
    const response: DashboardResponse = {
      kpis: {
        totalHoursThisWeek: 32.5,
        totalHoursToday: 3.5,
        activeProjectsCount: 4,
        billablePercentage: 75,
      },
      hoursPerDay: Array.from({ length: 7 }, (_, i) => ({
        date: `2026-03-${16 + i}`,
        totalHours: i === 0 ? 6.5 : 0,
      })),
      hoursByProject: [
        { projectId: "p1", projectName: "Project A", projectColor: "#10b981", totalHours: 20 },
        { projectId: "p2", projectName: "Project B", projectColor: "#6366f1", totalHours: 12.5 },
      ],
      recentEntries: [],
    };

    expect(response.kpis.totalHoursThisWeek).toBe(32.5);
    expect(response.hoursPerDay).toHaveLength(7);
    expect(response.hoursByProject).toHaveLength(2);
    expect(response.recentEntries).toHaveLength(0);
  });
});

// ─── fmtHours helper tests ─────────────────────────────────────────────────────

function fmtHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

describe("fmtHours", () => {
  it("formats whole hours", () => {
    expect(fmtHours(3)).toBe("3h");
  });

  it("formats minutes only", () => {
    expect(fmtHours(0.5)).toBe("30m");
  });

  it("formats hours and minutes", () => {
    expect(fmtHours(2.5)).toBe("2h 30m");
    expect(fmtHours(1.25)).toBe("1h 15m");
  });

  it("formats zero", () => {
    expect(fmtHours(0)).toBe("0m");
  });
});
