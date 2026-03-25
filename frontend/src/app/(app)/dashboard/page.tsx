"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  TrendingUp,
  FolderOpen,
  DollarSign,
  Play,
  Timer,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/api/hooks/dashboard";
import { formatTime } from "@/lib/format";
import type { RecentEntryRow } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

const CHART_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  highlight?: boolean;
}

function KpiCard({ title, value, icon: Icon, description, highlight }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-emerald-500" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold tabular-nums ${highlight ? "text-emerald-500" : ""}`}>
          {value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent entry row ─────────────────────────────────────────────────────────

function RecentEntry({ entry }: { entry: RecentEntryRow }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      {entry.projectColor && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: entry.projectColor }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {entry.description ?? <span className="text-muted-foreground italic">No description</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.projectName ?? "No project"} · {format(parseISO(entry.entryDate), "MMM d")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {entry.isRunning ? (
          <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs">
            Running
          </Badge>
        ) : (
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {fmtHours(entry.durationDecimal ?? 0)}
          </span>
        )}
        <p className="text-xs text-muted-foreground">
          {formatTime(entry.startTime)}
          {entry.endTime && ` – ${formatTime(entry.endTime)}`}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton placeholders ────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const barData = (data?.hoursPerDay ?? []).map((d) => ({
    day: format(parseISO(d.date), "EEE"),
    hours: Number(d.totalHours.toFixed(1)),
  }));

  const pieData = (data?.hoursByProject ?? []).slice(0, 8).map((p) => ({
    name: p.projectName,
    value: Number(p.totalHours.toFixed(1)),
    color: p.projectColor ?? CHART_COLORS[0],
  }));

  const totalPieHours = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link href="/tracker" className={cn(buttonVariants({ size: "sm" }))}>
          <Play className="mr-1.5 h-4 w-4" />
          Start timer
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title="Hours this week"
              value={fmtHours(data?.kpis.totalHoursThisWeek ?? 0)}
              icon={Clock}
              description="Mon – Sun"
              highlight
            />
            <KpiCard
              title="Hours today"
              value={fmtHours(data?.kpis.totalHoursToday ?? 0)}
              icon={Timer}
              description="Completed entries"
            />
            <KpiCard
              title="Active projects"
              value={String(data?.kpis.activeProjectsCount ?? 0)}
              icon={FolderOpen}
              description="In your workspace"
            />
            <KpiCard
              title="Billable"
              value={`${data?.kpis.billablePercentage ?? 0}%`}
              icon={DollarSign}
              description="Of this week's hours"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Hours per day — bar chart (3/5) */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Hours — last 7 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <BarChart data={barData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}h`, "Hours"]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Hours by project — pie chart (2/5) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-emerald-500" />
              By project · this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : pieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No tracked time this week
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [fmtHours(Number(v)), ""]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-1 w-full space-y-1 text-xs">
                  {pieData.slice(0, 5).map((p, i) => (
                    <li key={p.name} className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: p.color || CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="truncate text-muted-foreground">{p.name}</span>
                      </span>
                      <span className="shrink-0 font-mono tabular-nums">
                        {totalPieHours > 0 ? `${Math.round((p.value / totalPieHours) * 100)}%` : "–"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent time entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-emerald-500" />
            Recent entries
          </CardTitle>
          <Link href="/tracker" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.recentEntries.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No time entries yet.</p>
              <Link href="/tracker" className={cn(buttonVariants({ size: "sm" }), "mt-3")}>
                <Play className="mr-1.5 h-4 w-4" />
                Start tracking
              </Link>
            </div>
          ) : (
            <div>
              {data?.recentEntries.map((entry) => (
                <RecentEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
