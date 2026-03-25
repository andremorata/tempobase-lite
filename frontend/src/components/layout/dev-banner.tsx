"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, X } from "lucide-react";

const STORAGE_KEY = "tempobase-dev-banner-dismissed";

type DevBannerState = {
  expanded: boolean;
  dismissed: boolean;
  expand: () => void;
  dismiss: () => void;
};

const DevBannerCtx = createContext<DevBannerState | null>(null);

function useDevBanner() {
  const ctx = useContext(DevBannerCtx);
  if (!ctx) throw new Error("useDevBanner must be used inside DevBannerProvider");
  return ctx;
}

/** Wrap the area that contains both the banner strip and the header toggle. */
export function DevBannerProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hidden by default until hydrated

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "1";
    setDismissed(wasDismissed);
    setExpanded(!wasDismissed);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
    setExpanded(false);
  }

  function expand() {
    setExpanded(true);
  }

  return (
    <DevBannerCtx.Provider value={{ expanded, dismissed, expand, dismiss }}>
      {children}
    </DevBannerCtx.Provider>
  );
}

/** The full warning banner — renders above the header. */
export function DevBannerStrip() {
  const { expanded, dismiss } = useDevBanner();

  if (!expanded) return null;

  return (
    <div
      className="relative overflow-hidden border-b"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.35 0.08 85), oklch(0.30 0.06 70))",
        borderColor: "oklch(0.55 0.14 85 / 0.2)",
      }}
    >
      {/* Subtle diagonal stripes */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            oklch(1 0 0) 8px,
            oklch(1 0 0) 10px
          )`,
        }}
      />

      <div className="relative flex items-start gap-3 px-4 py-3 sm:items-center sm:px-6">
        <div
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md sm:mt-0"
          style={{ background: "oklch(0.75 0.16 85 / 0.2)" }}
        >
          <AlertTriangle
            className="size-3.5"
            style={{ color: "oklch(0.82 0.16 85)" }}
          />
        </div>

        <p
          className="flex-1 text-[13px] leading-relaxed"
          style={{ color: "oklch(0.88 0.06 85)" }}
        >
          <span
            className="font-semibold"
            style={{ color: "oklch(0.92 0.1 85)" }}
          >
            Active development
          </span>{" "}
          &mdash; TempoBase is under active development. Data may be reset
          without notice. Please export or back up any information you want to
          keep.
        </p>

        <button
          onClick={dismiss}
          className="mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors sm:mt-0"
          style={{ color: "oklch(0.75 0.06 85)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "oklch(0.75 0.16 85 / 0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label="Dismiss development notice"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Small icon button for the header — visible only when the banner is dismissed. */
export function DevBannerToggle() {
  const { expanded, dismissed, expand } = useDevBanner();

  // Only show the toggle when the user has dismissed at least once AND banner is collapsed
  if (!dismissed || expanded) return null;

  return (
    <button
      onClick={expand}
      className="relative flex size-8 cursor-pointer items-center justify-center rounded-md text-amber-500 transition-colors hover:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-400/10"
      aria-label="Show development notice"
    >
      <AlertTriangle className="size-4" />
      {/* Tiny pulsing dot to draw attention */}
      <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
    </button>
  );
}
