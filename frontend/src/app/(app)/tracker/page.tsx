"use client";

import { TimerBar } from "@/components/tracker/timer-bar";
import { TimeEntryList } from "@/components/tracker/time-entry-list";

export default function TrackerPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tracker</h1>
      <TimerBar />
      <TimeEntryList />
    </div>
  );
}
