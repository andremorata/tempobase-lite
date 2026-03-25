import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FolderKanban,
  BarChart3,
  Users,
  Zap,
  Tag,
  ArrowRight,
  Shield,
  Moon,
} from "lucide-react";

/* ─── Static Data ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Clock,
    title: "One-Click Timer",
    desc: "Start tracking instantly. Pause, resume, or switch between tasks without losing a second.",
  },
  {
    icon: FolderKanban,
    title: "Projects & Tasks",
    desc: "Organize work by client, project, and task. Set budgets and monitor billable hours in real time.",
  },
  {
    icon: BarChart3,
    title: "Powerful Reports",
    desc: "Summary, detailed, and weekly views with charts. Export to CSV or generate shareable links.",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Invite teammates, assign roles, and track everyone\u2019s hours across one shared workspace.",
  },
  {
    icon: Zap,
    title: "Smart Dashboard",
    desc: "KPIs, trend charts, and activity feeds give you a real-time pulse on your team\u2019s productivity.",
  },
  {
    icon: Tag,
    title: "Tags & Billing",
    desc: "Tag entries, flag billable time, set hourly rates per project, and never miss a charge.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your workspace",
    desc: "Sign up in seconds. Name your workspace, set your currency and timezone \u2014 you\u2019re ready to go.",
  },
  {
    num: "02",
    title: "Track your time",
    desc: "Use the live timer or log entries manually. Organize everything by project, task, and tag.",
  },
  {
    num: "03",
    title: "Get insights",
    desc: "Run reports, visualize trends on the dashboard, export data, and share polished summaries with clients.",
  },
];

const highlights = [
  { icon: Shield, label: "Role-based access & audit trail" },
  { icon: Moon, label: "Dark mode that actually looks good" },
  { icon: BarChart3, label: "CSV import & export built in" },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] px-5 py-3 backdrop-blur-2xl sm:px-8"
           style={{ background: "oklch(0.08 0.005 264 / 0.85)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg"
               style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <rect x="7" y="7.5" width="18" height="3.5" rx="1.75" fill="#fff"/>
              <rect x="14.25" y="9" width="3.5" height="16.5" rx="1.75" fill="#fff"/>
              <circle cx="16" cy="27" r="1.2" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            TempoBase
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<Link href="/login" />}
            className="text-[13px] text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            Sign in
          </Button>
          <Button
            nativeButton={false}
            size="sm"
            render={<Link href="/register" />}
            className="text-[13px]"
          >
            Get started
            <ArrowRight className="size-3.5" data-icon="inline-end" />
          </Button>
        </div>
      </nav>

      {/* ━━━ Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-16"
               style={{
                 background: `
                   radial-gradient(ellipse 80% 60% at 25% 60%, oklch(0.696 0.178 162 / 0.12) 0%, transparent 60%),
                   radial-gradient(ellipse 60% 50% at 75% 30%, oklch(0.696 0.178 162 / 0.07) 0%, transparent 50%),
                   radial-gradient(ellipse 100% 80% at 50% 100%, oklch(0.25 0.02 264 / 0.5) 0%, transparent 60%),
                   oklch(0.07 0.005 264)
                 `,
               }}>
        {/* Grain overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
               backgroundSize: "256px 256px",
             }} />

        {/* Grid lines decoration */}
        <div className="pointer-events-none absolute inset-0"
             style={{
               backgroundImage: `
                 linear-gradient(to right, oklch(1 0 0 / 0.02) 1px, transparent 1px),
                 linear-gradient(to bottom, oklch(1 0 0 / 0.02) 1px, transparent 1px)
               `,
               backgroundSize: "80px 80px",
             }} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
          {/* Left — Copy */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3.5 py-1.5"
                 style={{
                   background: "linear-gradient(135deg, oklch(0.696 0.178 162 / 0.1), oklch(0.696 0.178 162 / 0.03))",
                   animation: "landing-fade-down 0.6s ease-out both",
                 }}>
              <span className="size-1.5 rounded-full bg-emerald-400"
                    style={{ animation: "landing-pulse-dot 2s ease-in-out infinite" }} />
              <span className="text-xs font-medium tracking-wide text-emerald-300/90">
                Free for individuals &middot; No credit card
              </span>
            </div>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.05] tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  animation: "landing-fade-up 0.8s ease-out 0.1s both",
                }}>
              Track every minute.{" "}
              <span className="italic"
                    style={{
                      background: "linear-gradient(135deg, #34d399, #10b981, #059669)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                Own every hour.
              </span>
            </h1>

            <p className="mt-5 text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-white/55 sm:mt-6"
               style={{ animation: "landing-fade-up 0.8s ease-out 0.25s both" }}>
              TempoBase is a focused time tracking app for freelancers and teams.
              Track billable hours, manage projects, generate reports, and get
              clear visibility into where your time actually goes.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
                 style={{ animation: "landing-fade-up 0.8s ease-out 0.4s both" }}>
              <Button
                nativeButton={false}
                size="lg"
                render={<Link href="/register" />}
                className="h-11 gap-2 rounded-xl px-6 text-[15px] font-semibold shadow-[0_0_24px_oklch(0.696_0.178_162/0.3)]"
              >
                Start tracking free
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button
                nativeButton={false}
                variant="ghost"
                size="lg"
                render={<Link href="/login" />}
                className="h-11 rounded-xl px-5 text-[15px] text-white/60 hover:bg-white/[0.06] hover:text-white"
              >
                I have an account
              </Button>
            </div>

            {/* Highlight pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start"
                 style={{ animation: "landing-fade-up 0.8s ease-out 0.55s both" }}>
              {highlights.map((h) => (
                <div key={h.label}
                     className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                  <h.icon className="size-3.5 text-emerald-400/70" />
                  <span className="text-xs text-white/45">{h.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating preview cards */}
          <div className="relative hidden h-[420px] w-full max-w-md flex-shrink-0 lg:block"
               style={{ animation: "landing-fade-up 1s ease-out 0.3s both" }}>
            {/* Card 1 — Timer */}
            <div className="absolute left-4 top-4 w-64 rounded-2xl border border-white/[0.08] p-5 shadow-2xl"
                 style={{
                   background: "linear-gradient(145deg, oklch(0.16 0.008 264 / 0.95), oklch(0.12 0.006 264 / 0.95))",
                   backdropFilter: "blur(20px)",
                   animation: "landing-float-a 7s ease-in-out infinite",
                 }}>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400"
                      style={{ animation: "landing-pulse-dot 2s ease-in-out infinite" }} />
                <span className="text-[11px] font-medium tracking-wide text-emerald-400/90 uppercase">
                  Recording
                </span>
              </div>
              <div className="mt-3 font-mono text-3xl font-light tracking-wider text-white/90"
                   style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                02:34:17
              </div>
              <div className="mt-2 text-[13px] text-white/40">Homepage redesign</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: "#f59e0b" }} />
                <span className="text-[11px] text-white/30">Acme Corp</span>
              </div>
            </div>

            {/* Card 2 — Weekly stats */}
            <div className="absolute right-0 top-24 w-56 rounded-2xl border border-white/[0.08] p-4 shadow-2xl"
                 style={{
                   background: "linear-gradient(145deg, oklch(0.16 0.008 264 / 0.95), oklch(0.12 0.006 264 / 0.95))",
                   backdropFilter: "blur(20px)",
                   animation: "landing-float-b 8s ease-in-out 1s infinite",
                 }}>
              <div className="text-[11px] font-medium text-white/40 uppercase tracking-wide">This week</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-white/90">32.5h</span>
                <span className="text-[11px] font-medium text-emerald-400">+12%</span>
              </div>
              {/* Mini bar chart */}
              <div className="mt-3 flex items-end gap-1.5 h-10">
                {[55, 70, 40, 85, 65, 90, 50].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm origin-bottom"
                       style={{
                         height: `${h}%`,
                         background: i === 5
                           ? "linear-gradient(to top, #10b981, #34d399)"
                           : "oklch(1 0 0 / 0.08)",
                         animation: `landing-bar-grow 0.6s ease-out ${0.8 + i * 0.08}s both`,
                       }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-white/20">
                <span>Mon</span><span>Sun</span>
              </div>
            </div>

            {/* Card 3 — Project progress */}
            <div className="absolute bottom-4 left-8 w-60 rounded-2xl border border-white/[0.08] p-4 shadow-2xl"
                 style={{
                   background: "linear-gradient(145deg, oklch(0.16 0.008 264 / 0.95), oklch(0.12 0.006 264 / 0.95))",
                   backdropFilter: "blur(20px)",
                   animation: "landing-float-c 6.5s ease-in-out 0.5s infinite",
                 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded" style={{ background: "#8b5cf6" }} />
                  <span className="text-[13px] font-medium text-white/80">Acme Corp</span>
                </div>
                <span className="text-[11px] font-medium text-white/30">85%</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full"
                     style={{
                       background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                       animation: "landing-progress 1.2s ease-out 1s both",
                     }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-white/30">
                <span>34 of 40 hours</span>
                <span>$4,250</span>
              </div>
            </div>

            {/* Ambient glow behind cards */}
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl opacity-40"
                 style={{
                   background: "radial-gradient(ellipse at 50% 50%, oklch(0.696 0.178 162 / 0.15), transparent 70%)",
                 }} />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"
             style={{ animation: "landing-fade-up 1s ease-out 0.8s both" }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest text-white/20 uppercase">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative bg-background py-24 sm:py-32">
        {/* Top fade from hero */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-24"
             style={{
               background: "linear-gradient(to bottom, oklch(0.07 0.005 264), transparent)",
             }} />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Everything you need
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              Time tracking that works the way you do
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Whether you bill by the hour, manage a team, or just want to understand where your day goes &mdash;
              TempoBase gives you clarity without the clutter.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={f.title}
                   className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_32px_oklch(0.696_0.178_162/0.06)]"
                   style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Icon */}
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ How It Works ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-secondary/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Simple by design
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              Up and running in minutes
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center sm:text-left">
                {/* Connector line (hidden on mobile and last item) */}
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute right-0 top-6 hidden h-px w-full translate-x-1/2 sm:block"
                       style={{
                         background: "linear-gradient(90deg, oklch(0.696 0.178 162 / 0.3), oklch(0.696 0.178 162 / 0.05))",
                       }} />
                )}
                {/* Number */}
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 font-mono text-sm font-bold text-primary sm:mx-0"
                     style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                  {s.num}
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Detailed Benefits ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left — text */}
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Built for real work
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                Not another bloated tool
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Most time trackers try to do everything. TempoBase focuses on doing the essentials
                exceptionally well &mdash; fast entry, clear organization, and actionable reports.
              </p>

              <dl className="mt-8 space-y-5">
                {[
                  {
                    term: "Multi-tenant workspaces",
                    detail: "Each team gets an isolated workspace with its own projects, clients, members, and billing settings.",
                  },
                  {
                    term: "Flexible time entry",
                    detail: "Start a live timer or log time manually. Edit, tag, and annotate entries after the fact.",
                  },
                  {
                    term: "Client-ready reports",
                    detail: "Generate summary, detailed, or weekly reports. Share them via secure public links with optional expiry.",
                  },
                  {
                    term: "Full audit trail",
                    detail: "Every change is logged. Know who did what and when \u2014 essential for compliance and accountability.",
                  },
                ].map((item) => (
                  <div key={item.term} className="flex gap-3">
                    <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <div className="size-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <dt className="text-[14px] font-semibold text-foreground">{item.term}</dt>
                      <dd className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{item.detail}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right — Stylized app preview */}
            <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-border/50 bg-card p-1 shadow-card lg:mx-0">
              <div className="rounded-[calc(1.5rem-4px)] bg-card">
                {/* Fake window bar */}
                <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-400/60" />
                    <div className="size-2.5 rounded-full bg-yellow-400/60" />
                    <div className="size-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <div className="ml-3 h-5 flex-1 rounded-md bg-muted/60" />
                </div>

                {/* Dashboard mockup */}
                <div className="space-y-4 p-5">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Today", value: "4h 12m", color: "text-primary" },
                      { label: "This week", value: "32.5h", color: "text-foreground" },
                      { label: "Billable", value: "87%", color: "text-emerald-500" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border/40 bg-background/50 p-3">
                        <div className="text-[10px] font-medium text-muted-foreground">{kpi.label}</div>
                        <div className={`mt-1 text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-xl border border-border/40 bg-background/50 p-4">
                    <div className="mb-3 text-[11px] font-semibold text-muted-foreground">Weekly overview</div>
                    <div className="flex items-end gap-2 h-20">
                      {[45, 68, 55, 72, 60, 85, 40].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm"
                             style={{
                               height: `${h}%`,
                               background: i === 5
                                 ? "linear-gradient(to top, oklch(0.696 0.178 162), oklch(0.765 0.15 163))"
                                 : "oklch(0.696 0.178 162 / 0.15)",
                             }} />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[8px] text-muted-foreground/60">
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <span key={i} className="flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Recent entries */}
                  <div className="space-y-2">
                    {[
                      { proj: "Acme Corp", task: "Homepage redesign", time: "2h 15m", color: "#8b5cf6" },
                      { proj: "Internal", task: "Sprint planning", time: "1h 00m", color: "#10b981" },
                      { proj: "Acme Corp", task: "API integration", time: "0h 57m", color: "#8b5cf6" },
                    ].map((entry) => (
                      <div key={entry.task}
                           className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-sm" style={{ background: entry.color }} />
                          <div>
                            <div className="text-[11px] font-medium text-foreground">{entry.task}</div>
                            <div className="text-[9px] text-muted-foreground">{entry.proj}</div>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground"
                              style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                          {entry.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden py-24 sm:py-32"
               style={{
                 background: `
                   radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.696 0.178 162 / 0.08) 0%, transparent 60%),
                   oklch(0.07 0.005 264)
                 `,
               }}>
        {/* Grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
               backgroundSize: "256px 256px",
             }} />

        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="text-3xl font-normal tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
            Your time is valuable.{" "}
            <span className="italic"
                  style={{
                    background: "linear-gradient(135deg, #34d399, #10b981)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
              Start tracking it.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/45">
            Join teams who&apos;ve replaced spreadsheets and sticky notes with
            a tool that actually makes time tracking painless.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              size="lg"
              render={<Link href="/register" />}
              className="h-11 gap-2 rounded-xl px-6 text-[15px] font-semibold shadow-[0_0_24px_oklch(0.696_0.178_162/0.3)]"
            >
              Get started free
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button
              nativeButton={false}
              variant="ghost"
              size="lg"
              render={<Link href="/login" />}
              className="h-11 rounded-xl px-5 text-[15px] text-white/60 hover:bg-white/[0.06] hover:text-white"
            >
              Sign in
            </Button>
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-white/[0.06] py-8"
              style={{ background: "oklch(0.06 0.004 264)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded-md"
                 style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                <rect x="7" y="7.5" width="18" height="3.5" rx="1.75" fill="#fff"/>
                <rect x="14.25" y="9" width="3.5" height="16.5" rx="1.75" fill="#fff"/>
              </svg>
            </div>
            <span className="text-[13px] font-medium text-white/40">
              TempoBase
            </span>
          </div>
          <p className="text-[12px] text-white/25">
            &copy; {new Date().getFullYear()} TempoBase. Built with Next.js, Prisma &amp; PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}
