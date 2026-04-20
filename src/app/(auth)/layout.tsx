import {
  GitBranch,
  ScanLine,
  Map,
  MessageSquare,
  GitPullRequest,
  Network,
  MessageCircle,
  ClipboardList,
  Lightbulb,
  Users,
  Zap,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"

const STEPS = [
  {
    icon: GitBranch,
    label: "Connect repo",
    desc: "OAuth in one click",
  },
  {
    icon: ScanLine,
    label: "AI scans codebase",
    desc: "Commits, PRs, structure",
  },
  {
    icon: Map,
    label: "Interactive tour",
    desc: "Personalised per role",
  },
  {
    icon: MessageSquare,
    label: "Chat with codebase",
    desc: "Natural language Q&A",
  },
  {
    icon: GitPullRequest,
    label: "First real PR",
    desc: "Days, not weeks",
  },
]

const FEATURES = [
  {
    icon: Network,
    name: "Knowledge Graph",
    desc: "Auto-maps architecture, modules & APIs",
    iconColor: "oklch(0.59 0.243 264.4)",
    bgColor: "oklch(0.245 0.08 264.4)",
    borderColor: "oklch(0.35 0.12 264.4)",
  },
  {
    icon: MessageCircle,
    name: "Context-Aware Chat",
    desc: "Answers any codebase question instantly",
    iconColor: "oklch(0.74 0.175 60)",
    bgColor: "oklch(0.225 0.05 60)",
    borderColor: "oklch(0.32 0.09 60)",
  },
  {
    icon: ClipboardList,
    name: "Onboarding Checklist",
    desc: "Dynamic setup tasks, auto-generated",
    iconColor: "oklch(0.63 0.145 163)",
    bgColor: "oklch(0.215 0.04 163)",
    borderColor: "oklch(0.3 0.08 163)",
  },
  {
    icon: Lightbulb,
    name: "First Issue Recommender",
    desc: "Good-first-issue matching by skill level",
    iconColor: "oklch(0.74 0.175 60)",
    bgColor: "oklch(0.225 0.05 60)",
    borderColor: "oklch(0.32 0.09 60)",
  },
  {
    icon: GitPullRequest,
    name: "Guided PR Workflow",
    desc: "Step-by-step guidance for first commit",
    iconColor: "oklch(0.59 0.243 264.4)",
    bgColor: "oklch(0.245 0.08 264.4)",
    borderColor: "oklch(0.35 0.12 264.4)",
  },
  {
    icon: ShieldCheck,
    name: "Enterprise Security",
    desc: "SSO, audit logs, role-based access",
    iconColor: "oklch(0.63 0.145 163)",
    bgColor: "oklch(0.215 0.04 163)",
    borderColor: "oklch(0.3 0.08 163)",
  },
]

const STATS = [
  { icon: Users, value: "200+", label: "teams onboarded" },
  { icon: Zap, value: "4.2 days", label: "avg to first PR" },
  { icon: TrendingUp, value: "80%", label: "faster onboarding" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      {/* ── Left panel ── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[58%] xl:w-[60%]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.06 264.4) 0%, oklch(0.13 0.04 264.4) 60%, oklch(0.10 0.03 264.4) 100%)",
        }}
      >
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.8 0.1 264.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.59 0.243 264.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 -left-24 h-[400px] w-[400px] rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, oklch(0.74 0.175 60) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.59 0.243 264.4), oklch(0.487 0.243 264.4))",
                boxShadow: "0 0 20px oklch(0.59 0.243 264.4 / 0.4)",
              }}
            >
              <GitBranch className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Codebase Onboarding</span>
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                background: "oklch(0.245 0.08 264.4)",
                color: "oklch(0.74 0.2 264.4)",
                border: "1px solid oklch(0.35 0.12 264.4)",
              }}
            >
              Enterprise
            </span>
          </div>

          {/* Hero copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "oklch(0.225 0.05 60 / 0.5)",
                  color: "oklch(0.74 0.175 60)",
                  border: "1px solid oklch(0.32 0.09 60 / 0.6)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.175_60)] animate-pulse" />
                AI-powered developer onboarding
              </div>

              <h1
                className="text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl"
              >
                Ship confident engineers
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.74 0.175 60), oklch(0.85 0.15 80))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  from day one.
                </span>
              </h1>

              <p className="max-w-md text-sm leading-relaxed text-white/60">
                Connect your GitHub repo and generate a fully personalised onboarding guide
                in minutes. New hires ship their first real PR in days, not weeks.
              </p>
            </div>

            {/* 5-step flow */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                How it works
              </p>
              <div className="flex items-start gap-0">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={step.label} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        {/* Connector line left */}
                        <div
                          className={`h-px flex-1 ${i === 0 ? "opacity-0" : ""}`}
                          style={{
                            background:
                              "linear-gradient(90deg, oklch(0.35 0.12 264.4), oklch(0.3 0.1 264.4))",
                          }}
                        />
                        {/* Step circle */}
                        <div
                          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: "oklch(0.245 0.08 264.4)",
                            border: "1px solid oklch(0.35 0.12 264.4)",
                            boxShadow: "0 0 12px oklch(0.59 0.243 264.4 / 0.2)",
                          }}
                        >
                          <Icon className="h-4 w-4 text-[oklch(0.74_0.2_264.4)]" />
                          <span
                            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                            style={{
                              background: "oklch(0.59 0.243 264.4)",
                              color: "white",
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        {/* Connector line right */}
                        <div
                          className={`h-px flex-1 ${i === STEPS.length - 1 ? "opacity-0" : ""}`}
                          style={{
                            background:
                              "linear-gradient(90deg, oklch(0.3 0.1 264.4), oklch(0.35 0.12 264.4))",
                          }}
                        />
                      </div>
                      <div className="mt-2.5 px-1 text-center">
                        <p className="text-[11px] font-semibold leading-tight text-white/80">
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-tight text-white/40">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                Enterprise features
              </p>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                {FEATURES.map((feat) => {
                  const Icon = feat.icon
                  return (
                    <div
                      key={feat.name}
                      className="group rounded-xl p-3 transition-all duration-200"
                      style={{
                        background: "oklch(0.19 0.05 264.4 / 0.6)",
                        border: "1px solid oklch(0.28 0.05 264.4)",
                      }}
                    >
                      <div
                        className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          background: feat.bgColor,
                          border: `1px solid ${feat.borderColor}`,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: feat.iconColor }} />
                      </div>
                      <p className="text-[11px] font-semibold leading-tight text-white/85">
                        {feat.name}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-white/40">
                        {feat.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom stats + testimonial */}
          <div className="space-y-5">
            {/* Testimonial */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.19 0.05 264.4 / 0.5)",
                border: "1px solid oklch(0.28 0.05 264.4)",
              }}
            >
              <p className="text-[13px] italic leading-relaxed text-white/70">
                "We cut onboarding from three weeks to four days. Every new hire
                says it's the best onboarding experience they've ever had."
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ background: "oklch(0.487 0.243 264.4)" }}
                >
                  SC
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80">Sarah Chen</p>
                  <p className="text-[11px] text-white/40">Engineering Lead · Acme Corp</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: "oklch(0.245 0.08 264.4)" }}
                  >
                    <Icon className="h-3.5 w-3.5 text-[oklch(0.74_0.2_264.4)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{value}</p>
                    <p className="text-[11px] text-white/40">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "oklch(0.546 0.243 264.4)" }}
          >
            <GitBranch className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">Codebase Onboarding</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>

        <p className="mt-8 text-center text-xs text-foreground-muted">
          By signing in you agree to our{" "}
          <span className="text-foreground underline-offset-2 hover:underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-foreground underline-offset-2 hover:underline cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  )
}
