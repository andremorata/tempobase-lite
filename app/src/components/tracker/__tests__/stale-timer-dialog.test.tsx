import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockStopMutate, mockCancelMutate } = vi.hoisted(() => ({
  mockStopMutate: vi.fn(),
  mockCancelMutate: vi.fn(),
}));

vi.mock("@/lib/api/hooks/time-entries", () => ({
  useStopTimer: () => ({ mutate: mockStopMutate, isPending: false }),
  useCancelTimer: () => ({ mutate: mockCancelMutate, isPending: false }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { StaleTimerDialog, startedBeforeToday } from "../stale-timer-dialog";
import type { TimeEntry } from "@/lib/api/types";

const NOW = new Date("2026-03-31T09:00:00.000Z");

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: "entry-1",
    accountId: "acc-1",
    userId: "user-1",
    description: "Overnight work",
    entryDate: "2026-03-30",
    // Local-time midday on the previous day, so the assertions hold in any timezone
    startTime: new Date(2026, 2, 30, 12, 0, 0).toISOString(),
    endTime: null,
    duration: null,
    durationDecimal: null,
    isBillable: true,
    isRunning: true,
    lastSessionEndAt: new Date(2026, 2, 30, 18, 47, 0).toISOString(),
    tagIds: [],
    createdAt: new Date(2026, 2, 30, 12, 0, 0).toISOString(),
    updatedAt: null,
    ...overrides,
  };
}

describe("startedBeforeToday", () => {
  it("is true for a start on an earlier calendar day", () => {
    expect(startedBeforeToday(new Date(2026, 2, 30, 23, 59).toISOString(), new Date(2026, 2, 31, 0, 1))).toBe(true);
  });

  it("is false for a start earlier on the same day", () => {
    expect(startedBeforeToday(new Date(2026, 2, 31, 0, 1).toISOString(), new Date(2026, 2, 31, 23, 59))).toBe(false);
  });
});

describe("StaleTimerDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(NOW);

    // This jsdom environment has no localStorage, so stand in a minimal in-memory one
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders nothing when the timer started today", () => {
    const entry = makeEntry({ startTime: new Date(2026, 2, 31, 8, 0, 0).toISOString() });
    render(<StaleTimerDialog entry={entry} onResolved={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers the last heartbeat as the stop time for an overnight timer", () => {
    const entry = makeEntry();
    const onResolved = vi.fn();
    render(<StaleTimerDialog entry={entry} onResolved={onResolved} />);

    fireEvent.click(screen.getByRole("button", { name: /^Stop at / }));

    expect(mockStopMutate).toHaveBeenCalledWith(entry.lastSessionEndAt, expect.anything());
  });

  it("falls back to stopping now when there is no heartbeat", () => {
    render(<StaleTimerDialog entry={makeEntry({ lastSessionEndAt: null })} onResolved={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop now" }));

    expect(mockStopMutate).toHaveBeenCalledWith(undefined, expect.anything());
  });

  it("discards the entry via the cancel mutation", () => {
    render(<StaleTimerDialog entry={makeEntry()} onResolved={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Discard timer" }));

    expect(mockCancelMutate).toHaveBeenCalledWith("entry-1", expect.anything());
  });

  it("stays dismissed for the same entry after choosing to keep running", () => {
    const entry = makeEntry();
    const { unmount } = render(<StaleTimerDialog entry={entry} onResolved={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Keep running" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    unmount();
    render(<StaleTimerDialog entry={entry} onResolved={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reappears for a different stale entry", () => {
    const { unmount } = render(<StaleTimerDialog entry={makeEntry()} onResolved={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Keep running" }));
    unmount();

    render(<StaleTimerDialog entry={makeEntry({ id: "entry-2" })} onResolved={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
