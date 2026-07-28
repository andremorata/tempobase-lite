"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStopTimer, useCancelTimer } from "@/lib/api/hooks/time-entries";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDate, formatTime, secondsToHMS } from "@/lib/format";
import type { TimeEntry } from "@/lib/api/types";
import { toast } from "sonner";

// Only one timer can run at a time, so a single slot is enough to remember a "keep running" choice.
// localStorage (not component state) so the choice survives a reload of the same stale entry.
const DISMISS_KEY = "tempobase.staleTimerDismissed";

function readDismissedId(): string | null {
  try {
    return window.localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

function writeDismissedId(id: string): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, id);
  } catch {
    // Private mode / storage disabled — the dialog just reappears next reload
  }
}

/** True when the timer started on an earlier calendar day than `now` (local time). */
export function startedBeforeToday(startTime: string, now: Date = new Date()): boolean {
  const start = new Date(startTime);
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return startDay < today;
}

interface StaleTimerDialogProps {
  entry: TimeEntry | null | undefined;
  /** Called after the timer is stopped or discarded, so the tracker form can reset. */
  onResolved: () => void;
}

/**
 * Recovery prompt for a timer left running across midnight — typically because the PWA window was
 * closed, crashed, or the machine slept. Offers the last heartbeat as the stop time when we have one.
 */
export function StaleTimerDialog({ entry, onResolved }: StaleTimerDialogProps) {
  // Both are read once, on the client only. `openedAt` doubles as the SSR gate (localStorage and
  // the local clock are unavailable on the server) and as the frozen reference time — this dialog
  // states a snapshot, it is not a live ticker. Rendering null on the server is hydration-safe
  // because Radix renders the dialog into a portal, emitting no inline DOM either way.
  const [openedAt] = useState<Date | null>(() =>
    typeof window === "undefined" ? null : new Date(),
  );
  const [dismissedId, setDismissedId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readDismissedId(),
  );

  const stopTimer = useStopTimer();
  const cancelTimer = useCancelTimer();

  if (!entry || !openedAt) return null;

  const open = startedBeforeToday(entry.startTime, openedAt) && entry.id !== dismissedId;

  // A heartbeat only helps if it is actually after the start — otherwise fall back to stopping now
  const lastSeen =
    entry.lastSeenAt && new Date(entry.lastSeenAt) > new Date(entry.startTime)
      ? new Date(entry.lastSeenAt)
      : null;

  const start = new Date(entry.startTime);
  const elapsedSeconds = Math.floor((openedAt.getTime() - start.getTime()) / 1000);
  const pending = stopTimer.isPending || cancelTimer.isPending;

  const keepRunning = () => {
    writeDismissedId(entry.id);
    setDismissedId(entry.id);
  };

  const handleStop = () => {
    stopTimer.mutate(lastSeen?.toISOString(), {
      onSuccess: () => onResolved(),
      onError: (error) => {
        toast.error("Could not stop the timer.", {
          description: getApiErrorMessage(error, "Failed to stop the timer."),
        });
      },
    });
  };

  const handleDiscard = () => {
    cancelTimer.mutate(entry.id, {
      onSuccess: () => onResolved(),
      onError: (error) => {
        toast.error("Could not discard the entry.", {
          description: getApiErrorMessage(error, "Failed to discard the entry."),
        });
      },
    });
  };

  return (
    <Dialog
      open={open}
      // Esc / click-outside means "leave it alone", the least destructive choice
      onOpenChange={(next) => {
        if (!next) keepRunning();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer still running from {formatDate(entry.startTime)}</DialogTitle>
          <DialogDescription>
            {entry.description ? `"${entry.description}" has` : "A timer has"} been running since{" "}
            {formatTime(entry.startTime)} — {secondsToHMS(elapsedSeconds)} so far.
            {lastSeen
              ? ` The app was last open at ${formatTime(lastSeen.toISOString())}.`
              : " There is no record of when the app was last open."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleDiscard}
            disabled={pending}
            className="text-muted-foreground hover:text-destructive"
          >
            Discard timer
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={keepRunning} disabled={pending}>
              Keep running
            </Button>
            <Button onClick={handleStop} disabled={pending}>
              {lastSeen ? `Stop at ${formatTime(lastSeen.toISOString())}` : "Stop now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
