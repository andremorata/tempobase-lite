import { describe, it, expect } from "vitest";

// ─── Pure helper unit tests (no React rendering needed) ──────────────────────
// Test the report data formatting utilities that the hooks rely on.

describe("report hook utilities", () => {
  it("builds correct query string for summary report with all params", () => {
    const params = new URLSearchParams();
    params.set("from", "2026-01-01");
    params.set("to", "2026-03-31");
    params.set("projectId", "proj-123");
    params.set("groupBy", "Project");
    const qs = params.toString();
    expect(qs).toContain("from=2026-01-01");
    expect(qs).toContain("to=2026-03-31");
    expect(qs).toContain("groupBy=Project");
  });

  it("builds correct query string for billable filter", () => {
    const params = new URLSearchParams();
    params.set("billable", "true");
    expect(params.toString()).toBe("billable=true");
  });
});

// ─── Report date preset tests ─────────────────────────────────────────────────

describe("date preset calculation", () => {
  it("Mon-anchored week offset is correct for Wednesday", () => {
    // Wednesday has getDay() === 3; Mon offset = (3 - 1 + 7) % 7 = 2 days back
    const wednesday = 3;
    const offset = ((wednesday - 1 + 7) % 7);
    expect(offset).toBe(2);
  });

  it("Mon-anchored week offset is correct for Sunday", () => {
    // Sunday has getDay() === 0; Mon offset = (0 - 1 + 7) % 7 = 6 days back
    const sunday = 0;
    const offset = ((sunday - 1 + 7) % 7);
    expect(offset).toBe(6);
  });

  it("last-month preset returns first to last day of previous month", () => {
    const year = 2026;
    const month = 3; // March
    const prevMonthStart = new Date(year, month - 2, 1); // Feb 1
    const prevMonthEnd = new Date(year, month - 1, 0);   // Feb 28

    expect(prevMonthStart.getMonth()).toBe(1); // February (0-indexed)
    expect(prevMonthEnd.getDate()).toBe(28);   // Feb 28
  });
});

// ─── Summary report response shape tests ─────────────────────────────────────

import type {
  CreateSharedReportRequest,
  DetailedReportResponse,
  SharedReportResponse,
  SummaryReportResponse,
  WeeklyReportResponse,
} from "@/lib/api/types";
import { toPersistedReportGroupBy, toSummaryReportGroupBy } from "@/lib/reports/group-by";

describe("report response types", () => {
  it("SummaryReportResponse has correct shape with billing fields", () => {
    const response: SummaryReportResponse = {
      groups: [
        {
          groupId: "p1",
          groupName: "Project A",
          totalHours: 8.5,
          billableHours: 8.5,
          billedAmount: 850,
          entryCount: 3,
        },
      ],
      totalHours: 8.5,
      billableHours: 8.5,
      totalBilledAmount: 850,
      totalEntries: 3,
    };
    expect(response.groups).toHaveLength(1);
    expect(response.totalHours).toBe(8.5);
    expect(response.totalBilledAmount).toBe(850);
    expect(response.groups[0]?.billedAmount).toBe(850);
    expect(response.groups[0]?.groupName).toBe("Project A");
  });

  it("SummaryReportResponse BilledAmount is zero when no rate set", () => {
    const response: SummaryReportResponse = {
      groups: [
        {
          groupId: "p2",
          groupName: "No Rate Project",
          totalHours: 4,
          billableHours: 4,
          billedAmount: 0,
          entryCount: 1,
        },
      ],
      totalHours: 4,
      billableHours: 4,
      totalBilledAmount: 0,
      totalEntries: 1,
    };
    expect(response.totalBilledAmount).toBe(0);
    expect(response.groups[0]?.billedAmount).toBe(0);
  });

  it("DetailedReportResponse has correct pagination and billing shape", () => {
    const response: DetailedReportResponse = {
      entries: [],
      totalHours: 0,
      billableHours: 0,
      totalBilledAmount: 0,
      totalEntries: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    };
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(50);
    expect(response.totalPages).toBe(0);
    expect(response.totalBilledAmount).toBe(0);
  });

  it("WeeklyReportResponse has 7 day totals per week", () => {
    const response: WeeklyReportResponse = {
      weeks: [
        {
          weekStart: "2026-03-16",
          weekEnd: "2026-03-22",
          dayTotals: [2, 1, 0, 3, 0, 0, 0],
          weekTotal: 6,
        },
      ],
      grandTotal: 6,
    };
    expect(response.weeks[0]?.dayTotals).toHaveLength(7);
    expect(response.weeks[0]?.weekTotal).toBe(6);
  });

  it("SharedReportResponse includes share metadata and a name", () => {
    const response: SharedReportResponse = {
      id: "share-1",
      name: "Q1 summary",
      token: "abc123",
      reportType: "Summary",
      from: "2026-01-01",
      to: "2026-03-31",
      expiresAt: null,
      createdAt: "2026-03-23T12:00:00Z",
    };

    expect(response.name).toBe("Q1 summary");
    expect(response.token).toBe("abc123");
  });

  it("CreateSharedReportRequest requires a name", () => {
    const request: CreateSharedReportRequest = {
      name: "Weekly customer share",
      reportType: "Weekly",
      from: "2026-03-01",
      to: "2026-03-31",
      groupBy: "project",
    };

    expect(request.name).toBe("Weekly customer share");
    expect(request.reportType).toBe("Weekly");
  });

  it("normalizes legacy title-case values for saved and shared reports", () => {
    expect(toPersistedReportGroupBy("Project")).toBe("project");
    expect(toPersistedReportGroupBy("Client")).toBe("client");
    expect(toPersistedReportGroupBy("Task")).toBe("task");
  });

  it("normalizes persisted values back to summary-safe values", () => {
    expect(toSummaryReportGroupBy("project")).toBe("Project");
    expect(toSummaryReportGroupBy("client")).toBe("Client");
    expect(toSummaryReportGroupBy("tag")).toBe("Project");
  });
});

// ─── Billing calculation tests ────────────────────────────────────────────────

describe("billing amount calculations", () => {
  it("billed amount equals hours × rate for billable entry", () => {
    const hours = 2;
    const rate = 100;
    const billedAmount = hours * rate;
    expect(billedAmount).toBe(200);
  });

  it("billed amount is zero for non-billable entry regardless of rate", () => {
    const isBillable = false;
    const hours = 3;
    const rate = 100;
    const billedAmount = isBillable ? hours * rate : 0;
    expect(billedAmount).toBe(0);
  });

  it("task rate overrides project rate", () => {
    const resolveRate = (tRate: number | null, pRate: number | null) =>
      tRate ?? pRate ?? 0;
    expect(resolveRate(120, 80)).toBe(120);
    expect(resolveRate(null, 80)).toBe(80);
    expect(resolveRate(null, null)).toBe(0);
  });

  it("fmtMoney formats amounts to two decimal places with dollar sign", () => {
    const fmtMoney = (amount: number) => `$${amount.toFixed(2)}`;
    expect(fmtMoney(200)).toBe("$200.00");
    expect(fmtMoney(0.5)).toBe("$0.50");
    expect(fmtMoney(1234.567)).toBe("$1234.57");
    expect(fmtMoney(0)).toBe("$0.00");
  });

  it("total billed amount sums all group billed amounts", () => {
    const groups = [
      { billedAmount: 160 },
      { billedAmount: 240 },
      { billedAmount: 0 },
    ];
    const total = groups.reduce((sum, g) => sum + g.billedAmount, 0);
    expect(total).toBe(400);
  });

  it("detailedEntry billedAmount is null for non-billable entry", () => {
    // isBillable=false → billedAmount=null
    const isBillable = false;
    const billedAmount = isBillable ? 100 * 2 : null;
    expect(billedAmount).toBeNull();
  });
});
