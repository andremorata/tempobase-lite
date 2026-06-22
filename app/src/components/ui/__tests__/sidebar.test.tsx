import { render, screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider, useSidebar } from "../sidebar";

// Controllable matchMedia mock — lets a test set the current match state and
// fire `change` events to simulate the window crossing a breakpoint.
type Listener = (e: { matches: boolean }) => void;
let mediaMatches = true;
let listeners: Listener[] = [];

function setMedia(matches: boolean) {
  mediaMatches = matches;
  act(() => {
    listeners.forEach((l) => l({ matches }));
  });
}

beforeEach(() => {
  mediaMatches = true;
  listeners = [];
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: mediaMatches,
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: Listener) => {
      listeners.push(cb);
    },
    removeEventListener: (_: string, cb: Listener) => {
      listeners = listeners.filter((l) => l !== cb);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

function Probe() {
  const { state, toggleSidebar } = useSidebar();
  return (
    <div>
      <span data-testid="state">{state}</span>
      <button onClick={toggleSidebar}>toggle</button>
    </div>
  );
}

describe("SidebarProvider autoCollapseBreakpoint", () => {
  it("starts collapsed to a rail when the window is below the breakpoint", () => {
    mediaMatches = false; // narrower than the breakpoint
    render(
      <SidebarProvider autoCollapseBreakpoint={1024}>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("collapsed");
  });

  it("starts expanded when the window is at/above the breakpoint", () => {
    mediaMatches = true; // at/above the breakpoint
    render(
      <SidebarProvider autoCollapseBreakpoint={1024}>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("expanded");
  });

  it("collapses and re-expands as the window crosses the breakpoint", () => {
    mediaMatches = true;
    render(
      <SidebarProvider autoCollapseBreakpoint={1024}>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("expanded");

    setMedia(false); // window shrinks below the breakpoint
    expect(screen.getByTestId("state").textContent).toBe("collapsed");

    setMedia(true); // window grows back above the breakpoint
    expect(screen.getByTestId("state").textContent).toBe("expanded");
  });

  it("does not revert a manual toggle until the breakpoint is crossed", () => {
    mediaMatches = true; // wide: auto-rule wants expanded
    render(
      <SidebarProvider autoCollapseBreakpoint={1024}>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("expanded");

    // User manually collapses to the rail — must stick, not snap back open.
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state").textContent).toBe("collapsed");
  });

  it("keeps the manual toggle working without a breakpoint set", () => {
    render(
      <SidebarProvider>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("expanded");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state").textContent).toBe("collapsed");
  });
});
