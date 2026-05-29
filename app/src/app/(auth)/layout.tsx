import { Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-muted/40">
      {/* Subtle dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(0.54 0.018 240) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
            <Clock className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">TempoBase</p>
            <p className="text-sm text-muted-foreground">Your time, quantified and clear.</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
