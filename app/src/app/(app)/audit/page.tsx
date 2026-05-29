"use client";

import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount, useCurrentUserProfile } from "@/lib/api/hooks/account";
import { useAuditLogs } from "@/lib/api/hooks/audit";

const ACTION_OPTIONS = ["All", "Created", "Updated", "Deleted"] as const;
const ENTITY_OPTIONS = [
  "All",
  "Account",
  "User",
  "Client",
  "Project",
  "ProjectTask",
  "Tag",
  "TimeEntry",
  "SharedReport",
  "SavedReport",
  "AccountInvite",
] as const;

function formatAuditTimestamp(
  iso: string,
  timezone: string,
  dateFormat: "ymd" | "dmy" | "mdy",
) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const dateText = dateFormat === "dmy"
    ? `${day}/${month}/${year}`
    : dateFormat === "mdy"
      ? `${month}/${day}/${year}`
      : `${year}-${month}-${day}`;
  const timeText = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateText} ${timeText}`;
}

export default function AuditPage() {
  const { data: account } = useAccount();
  const { data: profile } = useCurrentUserProfile();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<(typeof ACTION_OPTIONS)[number]>("All");
  const [entityType, setEntityType] = useState<(typeof ENTITY_OPTIONS)[number]>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      action: action === "All" ? undefined : action,
      entityType: entityType === "All" ? undefined : entityType,
      from: from ? `${from}T00:00:00Z` : undefined,
      to: to ? `${to}T23:59:59Z` : undefined,
      page,
      pageSize: 20,
    }),
    [search, action, entityType, from, to, page],
  );

  const { data, isLoading } = useAuditLogs(query);
  const timezone = account?.timezone ?? "UTC";
  const dateFormat = profile?.dateFormat === "system" || !profile?.dateFormat ? "ymd" : profile.dateFormat;
  const showAuditMetadata = profile?.showAuditMetadata ?? true;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Audit</h1>
        <p className="text-sm text-muted-foreground">
          Review create, update, and delete activity across your workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600" />
            <CardTitle>Filters</CardTitle>
          </div>
          <CardDescription>
            Narrow the audit log by actor, summary, action, entity, and date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="audit-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="audit-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pl-9"
                placeholder="Search actor, summary, entity type, or id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={(value) => { setAction(value as (typeof ACTION_OPTIONS)[number]); setPage(1); }}>
              <SelectTrigger aria-label="Action filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityType} onValueChange={(value) => { setEntityType(value as (typeof ENTITY_OPTIONS)[number]); setPage(1); }}>
              <SelectTrigger aria-label="Entity filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-from">From</Label>
            <Input
              id="audit-from"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-to">To</Label>
            <Input
              id="audit-to"
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit entries</CardTitle>
          <CardDescription>
            {isLoading ? "Loading activity…" : `${data?.totalCount ?? 0} matching entries`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoading && (data?.items.length ?? 0) === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No audit entries match the current filters.
            </div>
          ) : null}

          {data?.items.map((item) => {
            let parsedChanges: string | null = null;

            if (showAuditMetadata && item.changesJson) {
              try {
                parsedChanges = JSON.stringify(JSON.parse(item.changesJson), null, 2);
              } catch {
                parsedChanges = item.changesJson;
              }
            }

            return (
              <div key={item.id} className="rounded-lg border border-border/70 bg-card/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.action === "Deleted" ? "destructive" : item.action === "Created" ? "default" : "secondary"}>
                    {item.action}
                  </Badge>
                  <Badge variant="outline">{item.entityType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatAuditTimestamp(item.occurredAt, timezone, dateFormat)}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-foreground">{item.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.actorName || item.actorEmail || "System"}
                  {item.actorRole ? ` · ${item.actorRole}` : ""}
                  {item.entityId ? ` · ${item.entityId}` : ""}
                </p>

                {parsedChanges ? (
                  <pre className="mt-3 overflow-x-auto rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                    {parsedChanges}
                  </pre>
                ) : null}
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <p className="text-sm text-muted-foreground">
              Page {data?.page ?? page} of {data?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!data?.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!data?.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
