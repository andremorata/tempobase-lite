import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerBar } from "../timer-bar";

const { mockToastError, mockStartMutate, mockStopMutate, mockCancelMutate, mockUseRunningEntry } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockStartMutate: vi.fn(),
  mockStopMutate: vi.fn(),
  mockCancelMutate: vi.fn(),
  mockUseRunningEntry: vi.fn(),
}));

// ─── Mock all API hooks ───────────────────────────────────────────────────────

vi.mock("@/lib/api/hooks/time-entries", () => ({
  useStartTimer: () => ({ mutate: mockStartMutate, isPending: false }),
  useStopTimer: () => ({ mutate: mockStopMutate, isPending: false }),
  useRunningEntry: mockUseRunningEntry,
  useUpdateTimeEntry: () => ({ mutate: vi.fn(), isPending: false }),
  useAdjustTimerStart: () => ({ mutate: vi.fn(), isPending: false }),
  useTimeEntries: () => ({ data: [] }),
  useCancelTimer: () => ({ mutate: mockCancelMutate, isPending: false }),
}));

vi.mock("@/lib/api/hooks/account", () => ({
  useCurrentUserProfile: () => ({ data: undefined }),
}));

vi.mock("@/lib/api/hooks/projects", () => ({
  useProjects: () => ({ data: [] }),
}));

vi.mock("@/lib/api/hooks/tasks", () => ({
  useProjectTasks: () => ({ data: [] }),
}));

vi.mock("@/lib/api/hooks/tags", () => ({
  useTags: () => ({ data: [] }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
  },
}));

import { useRunningEntry } from "@/lib/api/hooks/time-entries";

function makeRunningEntry(overrides: Partial<NonNullable<ReturnType<typeof useRunningEntry>["data"]>> = {}) {
  const startTime = overrides.startTime ?? new Date().toISOString();

  return {
    id: "entry-1",
    accountId: "acc-1",
    userId: "user-1",
    startTime,
    entryDate: "2026-03-21",
    description: null,
    projectId: null,
    taskId: null,
    endTime: null,
    duration: null,
    isRunning: true,
    isBillable: true,
    tagIds: [],
    createdAt: startTime,
    updatedAt: startTime,
    ...overrides,
  };
}

// ─── Test wrapper ─────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("TimerBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRunningEntry.mockReturnValue({ data: undefined });
  });

  it("shows play button when no timer is running", () => {
    vi.mocked(useRunningEntry).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    // Play button should be present (Start timer title)
    expect(screen.getByTitle("Start timer (Ctrl+Shift+S)")).toBeDefined();
    // Stop button should not be present
    expect(screen.queryByTitle("Stop timer (Ctrl+Shift+S)")).toBeNull();
  });

  it("shows stop button and elapsed timer when a timer is running", () => {
    const startTime = new Date(Date.now() - 90 * 1000).toISOString(); // 1m30s ago

    vi.mocked(useRunningEntry).mockReturnValue({
      data: makeRunningEntry({ startTime }),
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    expect(screen.getByTitle("Cancelar tracking")).toBeDefined();
    expect(screen.getByTitle("Stop timer (Ctrl+Shift+S)")).toBeDefined();
    expect(screen.queryByTitle("Start timer (Ctrl+Shift+S)")).toBeNull();
    // Elapsed timer is shown in green
    const timerDisplay = screen.getByText(/\d+:\d\d:\d\d/);
    expect(timerDisplay).toBeDefined();
  });

  it("calls startTimer.mutate with correct payload when start is clicked", () => {
    vi.mocked(useRunningEntry).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    const descInput = screen.getByPlaceholderText("What are you working on?");
    fireEvent.change(descInput, { target: { value: "coding" } });

    const startBtn = screen.getByTitle("Start timer (Ctrl+Shift+S)");
    fireEvent.click(startBtn);

    expect(mockStartMutate).toHaveBeenCalledOnce();
    const [payload] = mockStartMutate.mock.calls[0];
    expect(payload.description).toBe("coding");
    expect(payload.isBillable).toBe(true); // default is billable
  });

  it("calls stopTimer.mutate when stop button is clicked", () => {
    const startTime = new Date().toISOString();

    vi.mocked(useRunningEntry).mockReturnValue({
      data: makeRunningEntry({ id: "entry-2", startTime }),
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    const stopBtn = screen.getByTitle("Stop timer (Ctrl+Shift+S)");
    fireEvent.click(stopBtn);

    expect(mockStopMutate).toHaveBeenCalledOnce();
  });

  it("calls cancelTimer.mutate with the running entry id when cancel is confirmed", () => {
    vi.mocked(useRunningEntry).mockReturnValue({
      data: makeRunningEntry({ id: "entry-cancel" }),
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByTitle("Cancelar tracking"));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar tracking" }));

    expect(mockCancelMutate).toHaveBeenCalledOnce();
    expect(mockCancelMutate).toHaveBeenCalledWith(
      "entry-cancel",
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("description input is editable when no timer is running", () => {
    vi.mocked(useRunningEntry).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useRunningEntry>);

    render(<TimerBar />, { wrapper: makeWrapper() });

    const input = screen.getByPlaceholderText("What are you working on?");
    expect(input.hasAttribute("disabled")).toBe(false);
  });

  it("shows a toast when start fails", () => {
    vi.mocked(useRunningEntry).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useRunningEntry>);

    // Simulate mutate calling onError
    mockStartMutate.mockImplementation((_data: unknown, opts: { onError?: (e: Error) => void }) => {
      opts?.onError?.(new Error("A timer is already running"));
    });

    render(<TimerBar />, { wrapper: makeWrapper() });

    const startBtn = screen.getByTitle("Start timer (Ctrl+Shift+S)");
    fireEvent.click(startBtn);

    expect(mockToastError).toHaveBeenCalledWith("Could not start timer.", {
      description: "A timer is already running",
    });
    expect(screen.queryByText("A timer is already running")).toBeNull();
  });
});
