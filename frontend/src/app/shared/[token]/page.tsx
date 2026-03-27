"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { Clock, AlertCircle, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const BASE_URL = "/api";

const CHART_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

type ChartThemeStyles = {
  tooltipContentStyle: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    color: string;
    boxShadow: string;
  };
  tooltipLabelStyle: {
    color: string;
  };
  tooltipItemStyle: {
    color: string;
  };
  tooltipCursor: {
    fill: string;
  };
};

function getChartThemeStyles(isDark: boolean): ChartThemeStyles {
  return isDark
    ? {
        tooltipContentStyle: {
          backgroundColor: "#2b303a",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: "0.5rem",
          color: "#f4f5f7",
          boxShadow: "0 12px 26px rgba(0, 0, 0, 0.35)",
        },
        tooltipLabelStyle: {
          color: "#b4bbc7",
        },
        tooltipItemStyle: {
          color: "#f4f5f7",
        },
        tooltipCursor: {
          fill: "rgba(255, 255, 255, 0.08)",
        },
      }
    : {
        tooltipContentStyle: {
          backgroundColor: "#ffffff",
          border: "1px solid #d8dde6",
          borderRadius: "0.5rem",
          color: "#1f2937",
          boxShadow: "0 12px 26px rgba(15, 23, 42, 0.12)",
        },
        tooltipLabelStyle: {
          color: "#667085",
        },
        tooltipItemStyle: {
          color: "#1f2937",
        },
        tooltipCursor: {
          fill: "rgba(15, 23, 42, 0.06)",
        },
      };
}

function fmtHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function fmtMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function fmtPeriod(from?: string | null, to?: string | null): string {
  if (!from && !to) return "All time";
  const f = from ? format(parseISO(from), "MMM d, yyyy") : "…";
  const t = to ? format(parseISO(to), "MMM d, yyyy") : "…";
  return `${f} – ${t}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SummaryGroupRow {
  groupId: string;
  groupName: string;
  color?: string | null;
  totalHours: number;
  billableHours: number;
  billedAmount: number;
  entryCount: number;
}

interface SummaryStats {
  groups: SummaryGroupRow[];
  totalHours: number;
  billableHours: number;
  totalBilledAmount: number;
  totalEntries: number;
}

interface DetailedEntry {
  id: string;
  projectName?: string | null;
  projectColor?: string | null;
  clientName?: string | null;
  taskName?: string | null;
  description?: string | null;
  entryDate: string;
  startTime: string;
  endTime?: string | null;
  durationDecimal?: number | null;
  isBillable: boolean;
  billedAmount?: number | null;
  tagNames: string[];
}

// Combined data returned for Summary shared reports
interface SharedSummaryData {
  summary: SummaryStats;
  entries: DetailedEntry[];
}

interface DetailedData {
  entries: DetailedEntry[];
  totalHours: number;
  billableHours: number;
  totalBilledAmount: number;
  totalEntries: number;
}

interface WeekRow {
  weekStart: string;
  weekEnd: string;
  dayTotals: number[];
  weekTotal: number;
}

interface WeeklyData {
  weeks: WeekRow[];
  grandTotal: number;
}

interface SharedReportPayload {
  name?: string | null;
  reportType: string;
  from?: string | null;
  to?: string | null;
  showAmounts?: boolean;
  data: SharedSummaryData | DetailedData | WeeklyData | null;
}

// ─── Summary view ──────────────────────────────────────────────────────────────

function SummaryView({
  payload,
  showAmounts,
  chartTheme,
}: {
  payload: SharedSummaryData;
  showAmounts: boolean;
  chartTheme: ChartThemeStyles;
}) {
  const { summary, entries } = payload;

  // Group entries: yearMonth → entryDate → entries[]
  const grouped = useMemo(() => {
    const months = new Map<string, Map<string, DetailedEntry[]>>();
    for (const entry of entries) {
      const ym = entry.entryDate.slice(0, 7);
      if (!months.has(ym)) months.set(ym, new Map());
      const dates = months.get(ym)!;
      if (!dates.has(entry.entryDate)) dates.set(entry.entryDate, []);
      dates.get(entry.entryDate)!.push(entry);
    }
    return new Map([...months.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  }, [entries]);

  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(
    () => new Set(grouped.keys())
  );
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleMonth = (ym: string) =>
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(ym)) {
        next.delete(ym);
      } else {
        next.add(ym);
      }
      return next;
    });

  const toggleDate = (date: string) =>
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });

  // Chart data: months ascending for bar chart
  const chartData = useMemo(
    () =>
      [...grouped.entries()]
        .map(([ym, dates]) => {
          const allEntries = [...dates.values()].flat();
          return {
            month: format(parseISO(ym + "-01"), "MMM yy"),
            hours: Number(allEntries.reduce((s, e) => s + (e.durationDecimal ?? 0), 0).toFixed(2)),
            billedAmount: allEntries.reduce((s, e) => s + (e.billedAmount ?? 0), 0),
          };
        })
        .reverse(),
    [grouped]
  );

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className={`grid grid-cols-2 gap-3 ${showAmounts ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Hours</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{fmtHours(summary.totalHours)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Billable Hours</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-500">{fmtHours(summary.billableHours)}</p>
        </div>
        {showAmounts && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Billed Amount</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-500">{fmtMoney(summary.totalBilledAmount)}</p>
          </div>
        )}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Entries</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{summary.totalEntries}</p>
        </div>
      </div>

      {/* Bar chart */}
      {chartData.length >= 1 && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hours per Month
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, _name, props) => {
                  const entry = props?.payload as (typeof chartData)[0] | undefined;
                  const label =
                    showAmounts && entry?.billedAmount != null && entry.billedAmount > 0
                      ? `${fmtHours(Number(v))} (${fmtMoney(entry.billedAmount)})`
                      : fmtHours(Number(v));
                  return [label, "Hours"];
                }}
                contentStyle={{ ...chartTheme.tooltipContentStyle, fontSize: 12 }}
                labelStyle={chartTheme.tooltipLabelStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                cursor={chartTheme.tooltipCursor}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Grid + Donut */}
      {grouped.size > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Hierarchical table */}
          <div className="flex-1 min-w-0 overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</span>
              <div className="flex items-center gap-8 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</span>
                {showAmounts && (
                  <span className="w-20 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</span>
                )}
              </div>
            </div>
            <div className="divide-y">
              {[...grouped.entries()].map(([ym, dateMap]) => {
                const allMonthEntries = [...dateMap.values()].flat();
                const monthTotal = allMonthEntries.reduce((s, e) => s + (e.durationDecimal ?? 0), 0);
                const monthBilled = allMonthEntries.reduce((s, e) => s + (e.billedAmount ?? 0), 0);
                const monthExpanded = !collapsedMonths.has(ym);
                const dateEntries = [...dateMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));

                return (
                  <div key={ym}>
                    <button
                      type="button"
                      onClick={() => toggleMonth(ym)}
                      className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {monthExpanded
                          ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                        <span className="text-sm font-semibold">
                          {format(parseISO(ym + "-01"), "MMMM yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({allMonthEntries.length} entries)
                        </span>
                      </div>
                      <div className="flex items-center gap-8 shrink-0">
                        <span className="text-sm font-bold tabular-nums">{fmtHours(monthTotal)}</span>
                        {showAmounts && (
                          <span className="w-20 text-right text-sm font-bold tabular-nums text-emerald-500">
                            {monthBilled > 0 ? fmtMoney(monthBilled) : <span className="text-muted-foreground">—</span>}
                          </span>
                        )}
                      </div>
                    </button>

                    {monthExpanded && dateEntries.map(([date, dayEntries]) => {
                      const dateTotal = dayEntries.reduce((s, e) => s + (e.durationDecimal ?? 0), 0);
                      const dateBilled = dayEntries.reduce((s, e) => s + (e.billedAmount ?? 0), 0);
                      const dateExpanded = expandedDates.has(date);
                      return (
                        <div key={date} className="bg-muted/10">
                          <button
                            type="button"
                            onClick={() => toggleDate(date)}
                            className="flex w-full items-center justify-between px-4 py-2.5 pl-10 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {dateExpanded
                                ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              }
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(date), "EEEE, MMM d")}
                              </span>
                              <span className="text-xs text-muted-foreground/50">({dayEntries.length})</span>
                            </div>
                            <div className="flex items-center gap-8 shrink-0">
                              <span className="text-sm tabular-nums text-muted-foreground">{fmtHours(dateTotal)}</span>
                              {showAmounts && (
                                <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
                                  {dateBilled > 0 ? (
                                    <span className="text-emerald-500">{fmtMoney(dateBilled)}</span>
                                  ) : "—"}
                                </span>
                              )}
                            </div>
                          </button>

                          {dateExpanded && dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between border-t border-border/20 px-4 py-2 pl-16 text-xs"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {entry.projectColor && (
                                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.projectColor }} />
                                )}
                                <span className="truncate text-foreground max-w-xs">
                                  {entry.description ?? <em className="text-muted-foreground/50">No description</em>}
                                </span>
                                {entry.projectName && (
                                  <span className="shrink-0 text-muted-foreground/60">
                                    · {entry.projectName}{entry.taskName ? ` / ${entry.taskName}` : ""}
                                  </span>
                                )}
                                {entry.isBillable && (
                                  <span className="shrink-0 font-bold text-emerald-500">$</span>
                                )}
                              </div>
                              <div className="flex items-center gap-8 ml-4 shrink-0">
                                <span className="tabular-nums text-muted-foreground">
                                  {fmtHours(entry.durationDecimal ?? 0)}
                                </span>
                                {showAmounts && (
                                  <span className="w-20 text-right tabular-nums">
                                    {entry.billedAmount != null && entry.billedAmount > 0 ? (
                                      <span className="text-emerald-500">{fmtMoney(entry.billedAmount)}</span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donut */}
          <div className="w-full sm:w-56 sm:shrink-0 rounded-lg border bg-card p-4 flex flex-col items-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground self-start">
              Distribution
            </p>
            <PieChart width={180} height={180}>
              <Pie
                data={chartData}
                dataKey="hours"
                nameKey="month"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, _name, props) => {
                  const entry = props?.payload as (typeof chartData)[0] | undefined;
                  const label =
                    showAmounts && entry?.billedAmount != null && entry.billedAmount > 0
                      ? `${fmtHours(Number(v))} (${fmtMoney(entry.billedAmount)})`
                      : fmtHours(Number(v));
                  return [label, "Hours"];
                }}
                contentStyle={{ ...chartTheme.tooltipContentStyle, fontSize: 11 }}
                labelStyle={chartTheme.tooltipLabelStyle}
                itemStyle={chartTheme.tooltipItemStyle}
              />
            </PieChart>
            <div className="mt-2 w-full space-y-1">
              {chartData.map((item, i) => (
                <div key={item.month} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{item.month}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="tabular-nums font-medium">{fmtHours(item.hours)}</span>
                    {showAmounts && item.billedAmount > 0 && (
                      <span className="tabular-nums text-emerald-500">{fmtMoney(item.billedAmount)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {grouped.size === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No data available for this report.</p>
        </div>
      )}
    </div>
  );
}

// ─── Detailed view ─────────────────────────────────────────────────────────────

function DetailedView({ data, showAmounts }: { data: DetailedData; showAmounts: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="rounded-lg border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Total </span>
          <span className="font-bold tabular-nums">{fmtHours(data.totalHours)}</span>
        </div>
        <div className="rounded-lg border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Billable </span>
          <span className="font-bold tabular-nums text-emerald-500">{fmtHours(data.billableHours)}</span>
        </div>
        {showAmounts && (
          <div className="rounded-lg border bg-card px-4 py-2">
            <span className="text-xs text-muted-foreground">Billed </span>
            <span className="font-bold tabular-nums text-emerald-500">{fmtMoney(data.totalBilledAmount)}</span>
          </div>
        )}
      </div>

      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Project</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-muted-foreground">Duration</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                  {entry.entryDate}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {entry.projectColor && (
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.projectColor }} />
                    )}
                    <span className="max-w-36 truncate">{entry.projectName ?? "—"}</span>
                  </div>
                </td>
                <td className="max-w-xs px-4 py-2.5 text-muted-foreground">
                  <span className="block truncate">{entry.description ?? "—"}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                  {fmtHours(entry.durationDecimal ?? 0)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                  {entry.billedAmount != null && entry.billedAmount > 0 ? (
                    <span className="text-emerald-500">{fmtMoney(entry.billedAmount)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Weekly view ───────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyView({ data, chartTheme }: { data: WeeklyData; chartTheme: ChartThemeStyles }) {
  const chartData = data.weeks.map((w) => ({
    week: format(new Date(w.weekStart + "T00:00:00"), "MMM d"),
    hours: Number(w.weekTotal.toFixed(2)),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card px-4 py-2 inline-block">
        <span className="text-xs text-muted-foreground">Grand Total </span>
        <span className="font-bold tabular-nums">{fmtHours(data.grandTotal)}</span>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hours per Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [fmtHours(Number(v)), "Hours"]}
                contentStyle={{ ...chartTheme.tooltipContentStyle, fontSize: 12 }}
                labelStyle={chartTheme.tooltipLabelStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                cursor={chartTheme.tooltipCursor}
              />
              <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">Week</th>
              {DAY_LABELS.map((d) => (
                <th key={d} className="px-3 py-2.5 text-right font-medium text-muted-foreground">{d}</th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.weeks.map((week) => (
              <tr key={week.weekStart} className="hover:bg-muted/30 transition-colors">
                <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                  {week.weekStart}
                </td>
                {week.dayTotals.map((h, i) => (
                  <td key={i} className={`px-3 py-2.5 text-right text-xs tabular-nums ${h > 0 ? "font-medium" : "text-muted-foreground"}`}>
                    {h > 0 ? fmtHours(h) : "—"}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{fmtHours(week.weekTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-muted/30">
            <tr>
              <td className="px-4 py-2.5 text-xs font-medium">Grand Total</td>
              {DAY_LABELS.map((_, i) => (
                <td key={i} className="px-3 py-2.5 text-right text-xs font-medium tabular-nums">
                  {fmtHours(data.weeks.reduce((sum, w) => sum + (w.dayTotals[i] ?? 0), 0))}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right font-bold tabular-nums text-emerald-500">
                {fmtHours(data.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SharedReportPayload | null>(null);
  const chartTheme = useMemo(() => getChartThemeStyles(resolvedTheme === "dark"), [resolvedTheme]);

  useEffect(() => {
    if (report?.name?.trim()) {
      document.title = `${report.name.trim()} - TempoBase`;
    }
  }, [report]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/public/reports/${token}`)
      .then(async (res) => {
        if (res.status === 404) throw new Error("Report not found.");
        if (res.status === 410) throw new Error("This shared report has expired.");
        if (!res.ok) throw new Error("Failed to load report.");
        return res.json() as Promise<SharedReportPayload>;
      })
      .then((data) => {
        setReport(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: Error) => {
        setReport(null);
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-5xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-emerald-500" />
            <div>
              <h1 className="text-lg font-bold">{report?.name?.trim() || "Shared Time Report"}</h1>
              <p className="text-xs text-muted-foreground">
                {report ? `${report.reportType} report • Public view • Read only` : "Public view — read only"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <div className="flex items-center gap-1.5 rounded-md border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{fmtPeriod(report.from, report.to)}</span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {report && !loading && (
          <div className="space-y-4">
            {report.reportType === "Summary" && report.data && (
              <SummaryView
                payload={report.data as SharedSummaryData}
                showAmounts={report.showAmounts ?? false}
                chartTheme={chartTheme}
              />
            )}
            {report.reportType === "Detailed" && report.data && (
              <DetailedView data={report.data as DetailedData} showAmounts={report.showAmounts ?? false} />
            )}
            {report.reportType === "Weekly" && report.data && (
              <WeeklyView data={report.data as WeeklyData} chartTheme={chartTheme} />
            )}
            {!report.data && (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No data available for this report.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
