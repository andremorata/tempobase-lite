"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Link, Plus, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SharedReportResponse } from "@/lib/api/types";

export function NameInput({
  onConfirm,
  onCancel,
  placeholder = "View name…",
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [name, setName] = useState("");

  const commit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onConfirm(trimmedName);
    setName("");
  };

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") onCancel();
        }}
        placeholder={placeholder}
        className="h-7 w-36 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <Button size="sm" onClick={commit} disabled={!name.trim()} className="h-7 px-2.5 text-xs">
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 px-2.5 text-xs">
        Cancel
      </Button>
    </div>
  );
}

export function SharedReportsControl({
  sharedReports,
  latestShareUrl,
  onCreate,
  onCopy,
  onDelete,
  isCreating,
  deletingShareId,
}: {
  sharedReports: SharedReportResponse[];
  latestShareUrl: string | null;
  onCreate: (name: string) => void;
  onCopy: (share: SharedReportResponse) => void;
  onDelete: (share: SharedReportResponse) => void;
  isCreating: boolean;
  deletingShareId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-40 truncate">Shared reports</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1.5 w-96 rounded-xl border bg-popover p-1.5 shadow-lg">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account shares</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateInput((value) => !value)}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Share current
                </Button>
              </div>

              {showCreateInput && (
                <div className="px-2 py-1">
                  <NameInput
                    placeholder="Shared report name…"
                    onConfirm={(name) => {
                      onCreate(name);
                      setShowCreateInput(false);
                      setOpen(false);
                    }}
                    onCancel={() => setShowCreateInput(false)}
                  />
                </div>
              )}

              <div className="mt-1 max-h-80 overflow-y-auto">
                {sharedReports.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No shared reports yet.</p>
                ) : (
                  sharedReports.map((share) => (
                    <div key={share.id} className="rounded-lg px-2 py-1.5 hover:bg-muted">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{share.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {share.reportType} report
                            {share.from || share.to ? ` • ${share.from ?? "…"} to ${share.to ?? "…"}` : " • All time"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDelete(share)}
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete shared report"
                          disabled={deletingShareId === share.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-nowrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onCopy(share)} className="h-7 px-2.5 text-xs gap-1">
                          <Link className="h-3 w-3" />
                          Copy link
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" onClick={() => window.open(`/shared/${share.token}`, "_blank", "noopener,noreferrer")}>
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isCreating && <span className="text-xs text-muted-foreground">Creating share…</span>}

      {latestShareUrl && (
        <div className="flex items-center gap-1.5 rounded-md border bg-muted px-3 py-1.5 text-xs">
          <Link className="h-3 w-3 shrink-0 text-emerald-500" />
          <span className="max-w-48 truncate font-mono">{latestShareUrl}</span>
          <span className="text-muted-foreground">(copied)</span>
        </div>
      )}
    </div>
  );
}
