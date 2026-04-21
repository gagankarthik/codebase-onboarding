"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Terminal,
  Download,
  Play,
  Shield,
  Eye,
  FileJson,
  GitBranch,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Zap,
  BookOpen,
  Package,
  Upload,
  Wrench,
  Tag,
  Bell,
  BarChart2,
  ArrowRight,
  Hash,
  Settings,
  Share2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({
  code,
  language = "bash",
  title,
}: {
  code: string
  language?: string
  title?: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-[hsl(var(--code-bg))]">
      {title && (
        <div className="flex items-center justify-between border-b border-border bg-background-muted/50 px-4 py-2">
          <span className="font-mono text-xs text-foreground-muted">{title}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      {!title && (
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground-muted shadow-sm transition-colors hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground">
        <code
          className={cn(
            "font-mono",
            language === "bash" && "[&_.comment]:text-foreground-subtle"
          )}
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language),
          }}
        />
      </pre>
    </div>
  )
}

function highlightCode(code: string, language: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  if (language === "bash") {
    return escaped
      .replace(/(^|\n)(#[^\n]*)/g, '$1<span class="text-foreground-subtle">$2</span>')
      .replace(/\b(npm|npx|onboardai|git|chmod|curl|cd|node)\b/g, '<span class="text-primary">$1</span>')
      .replace(/--([\w-]+)/g, '<span class="text-accent">--$1</span>')
  }
  if (language === "json") {
    return escaped
      .replace(/"([^"]+)":/g, '<span class="text-primary">"$1"</span>:')
      .replace(/:\s*"([^"]+)"/g, ': <span class="text-success">"$1"</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-accent">$1</span>')
  }
  if (language === "yaml") {
    return escaped
      .replace(/(^|\n)(#[^\n]*)/g, '$1<span class="text-foreground-subtle">$2</span>')
      .replace(/^(\s*)([\w-]+):/gm, '$1<span class="text-primary">$2</span>:')
  }
  return escaped
}

// ── Callout ───────────────────────────────────────────────────────────────────

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip"
  children: React.ReactNode
}) {
  const styles = {
    info: "border-primary/20 bg-primary-subtle",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20",
    tip: "border-success/20 bg-success-subtle",
  }
  const icons = {
    info: <Shield className="h-3.5 w-3.5 text-primary" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
    tip: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  }
  const textColor = {
    info: "text-foreground-muted",
    warning: "text-amber-700 dark:text-amber-400",
    tip: "text-foreground-muted",
  }

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", styles[type])}>
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      <div className={cn("text-xs leading-relaxed", textColor[type])}>{children}</div>
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionAnchor({ id, icon: Icon, title, badge: badgeText }: {
  id: string
  icon: typeof Terminal
  title: string
  badge?: string
}) {
  return (
    <div id={id} className="scroll-mt-20 flex items-center gap-3 group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {badgeText && (
        <Badge variant="secondary" className="text-xs">{badgeText}</Badge>
      )}
      <a
        href={`#${id}`}
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Link to section"
      >
        <Hash className="h-4 w-4 text-foreground-subtle" />
      </a>
    </div>
  )
}

// ── Flag table ────────────────────────────────────────────────────────────────

function FlagTable({ flags }: { flags: { flag: string; desc: string; default?: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-background-muted/60">
            <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Flag</th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Description</th>
            <th className="hidden px-4 py-2.5 text-left font-medium text-foreground-muted sm:table-cell">Default</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f, i) => (
            <tr key={f.flag} className={cn("border-b border-border last:border-0", i % 2 === 0 ? "" : "bg-background-subtle/50")}>
              <td className="px-4 py-2.5">
                <code className="font-mono text-primary">{f.flag}</code>
              </td>
              <td className="px-4 py-2.5 text-foreground-muted">{f.desc}</td>
              <td className="hidden px-4 py-2.5 text-foreground-subtle sm:table-cell">
                {f.default ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────

function Steps({ steps }: { steps: { label: string; content: React.ReactNode }[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="mt-2 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="pb-6 min-w-0 flex-1">
            <p className="mb-3 text-sm font-medium text-foreground">{step.label}</p>
            <div>{step.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Terminal preview ──────────────────────────────────────────────────────────

function TerminalPreview({ lines }: { lines: { text: string; color?: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[hsl(222,47%,6%)] shadow-inner">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 font-mono text-xs text-white/30">terminal</span>
      </div>
      <div className="space-y-0.5 p-4 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={cn("whitespace-pre", line.color ?? "text-white/70")}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Nav sections ──────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", group: null },
  { id: "installation", label: "Installation", group: "Getting started" },
  { id: "quick-start", label: "Quick start", group: null },
  { id: "security", label: "security", group: "Commands" },
  { id: "init", label: "init", group: null },
  { id: "status", label: "status", group: null },
  { id: "fix", label: "fix", group: null },
  { id: "monitor", label: "monitor", group: null },
  { id: "sync", label: "sync", group: null },
  { id: "report-share", label: "report / share", group: null },
  { id: "watch-mode", label: "Watch mode", group: "Guides" },
  { id: "json-output", label: "JSON output", group: null },
  { id: "ci", label: "CI integration", group: null },
  { id: "dashboard", label: "Dashboard sync", group: null },
  { id: "events", label: "Web events", group: null },
  { id: "local-dev", label: "Local development", group: "Publishing" },
  { id: "npm-publish", label: "Publish to npm", group: null },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [active, setActive] = useState("overview")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const ids = NAV_SECTIONS.map((s) => s.id)
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const topmost = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          setActive(topmost.target.id)
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    )

    els.forEach((el) => observerRef.current!.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setMobileNavOpen(false)
  }

  function NavItems() {
    let lastGroupInner: string | null = "—"
    return (
      <>
        {NAV_SECTIONS.map((s) => {
          const showGroup = s.group !== null && s.group !== lastGroupInner
          if (showGroup) lastGroupInner = s.group
          return (
            <div key={s.id}>
              {showGroup && (
                <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle first:mt-0">
                  {s.group}
                </p>
              )}
              <button
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors",
                  active === s.id
                    ? "bg-primary-subtle font-medium text-primary"
                    : "text-foreground-muted hover:bg-background-muted hover:text-foreground"
                )}
              >
                {active === s.id && <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className={cn(s.id !== active && "ml-[18px]", "font-mono")}>{s.label}</span>
              </button>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      {/* ── Mobile nav toggle ── */}
      <div className="mb-6 lg:hidden">
        <button
          onClick={() => setMobileNavOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-border bg-background-muted px-3 py-2 text-xs font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Contents
          <ChevronRight
            className={cn("ml-auto h-3.5 w-3.5 transition-transform", mobileNavOpen && "rotate-90")}
          />
        </button>
        {mobileNavOpen && (
          <div className="mt-2 rounded-xl border border-border bg-background p-3 shadow-md">
            <NavItems />
          </div>
        )}
      </div>

      <div className="flex gap-10">
        {/* ── Left nav (desktop) ── */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 space-y-0.5">
            <NavItems />
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1 space-y-16">
          {/* ══ Overview ══ */}
          <motion.section
            id="overview"
            className="scroll-mt-20 space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  OnboardAI CLI
                </h1>
                <Badge variant="secondary" className="font-mono text-xs">v1.0.0</Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground-muted">
                A zero-config CLI for accelerating developer onboarding. Security scanning, environment setup,
                web event monitoring, and dashboard sync — all from your terminal.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Shield, title: "Security scanning", desc: "Detect secrets, unsafe patterns, and CVEs before they reach production." },
                { icon: Bell, title: "Web event monitor", desc: "Stream live errors, warnings, and API failures with AI root-cause analysis." },
                { icon: BarChart2, title: "Dashboard sync", desc: "Push progress and scan results to your team's OnboardAI dashboard." },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle">
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{card.title}</p>
                  <p className="text-xs text-foreground-muted leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <TerminalPreview
              lines={[
                { text: "$ onboardai security", color: "text-white/90" },
                { text: "" },
                { text: "  🔒 OnboardAI — Security Audit", color: "text-white" },
                { text: "  ─────────────────────────────────────────", color: "text-white/20" },
                { text: "" },
                { text: "  ── Dependency vulnerabilities ──", color: "text-white/40" },
                { text: "  ✓ No dependency vulnerabilities found", color: "text-emerald-400" },
                { text: "  ── Secret scanning ──", color: "text-white/40" },
                { text: "  ✓ No hardcoded secrets detected", color: "text-emerald-400" },
                { text: "  ── Code pattern analysis ──", color: "text-white/40" },
                { text: "  ⚠ eval() usage  src/utils/parse.ts:42", color: "text-yellow-400" },
                { text: "  ── Environment files ──", color: "text-white/40" },
                { text: "  ✓ .env files not tracked by git", color: "text-emerald-400" },
                { text: "" },
                { text: "  Security Score", color: "text-white/70" },
                { text: "  [████████████████████░░░░]", color: "text-white/40" },
                { text: "  84/100  [GOOD]", color: "text-yellow-400" },
              ]}
            />
          </motion.section>

          <hr className="border-border" />

          {/* ══ Installation ══ */}
          <section id="installation" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="installation" icon={Download} title="Installation" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Install globally with npm or run on demand with{" "}
              <code className="rounded bg-background-muted px-1.5 py-0.5 font-mono text-xs">npx</code>.
              Requires Node.js 18+.
            </p>
            <Steps
              steps={[
                {
                  label: "Install globally",
                  content: <CodeBlock code="npm install -g onboardai" />,
                },
                {
                  label: "Or run without installing",
                  content: <CodeBlock code="npx onboardai security" />,
                },
                {
                  label: "Verify the installation",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code="onboardai --version" />
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-2 text-xs font-medium text-foreground">Requirements</p>
                        <ul className="space-y-1.5">
                          {["Node.js ≥ 18.0.0", "npm ≥ 8.0.0", "Git (optional — for hook installation)"].map((r) => (
                            <li key={r} className="flex items-center gap-2 text-xs text-foreground-muted">
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </section>

          <hr className="border-border" />

          {/* ══ Quick start ══ */}
          <section id="quick-start" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="quick-start" icon={Play} title="Quick start" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Three commands to go from zero to a fully checked environment.
            </p>
            <CodeBlock
              code={`cd /path/to/your-project

# Set up environment (installs deps, copies .env.example, installs git hooks)
onboardai init

# Full security audit
onboardai security

# Verify everything is ready
onboardai status`}
            />
          </section>

          <hr className="border-border" />

          {/* ══════════════════ COMMANDS ══════════════════ */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Command reference
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Commands</h2>
            <p className="text-sm text-foreground-muted">
              Full reference for every <code className="rounded bg-background-muted px-1 font-mono text-xs">onboardai</code> command and its flags.
            </p>
          </div>

          {/* ── security ── */}
          <section id="security" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="security" icon={Shield} title="onboardai security" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Scans your codebase for hardcoded secrets, unsafe code patterns, dependency CVEs,
              and exposed <code className="rounded bg-background-muted px-1 font-mono text-xs">.env</code> files.
              Returns a score from 0–100.
            </p>
            <CodeBlock code="onboardai security" />
            <FlagTable
              flags={[
                { flag: "--watch", desc: "Re-scan on every file save (500ms debounce)" },
                { flag: "--output json", desc: "Emit structured JSON to stdout" },
                { flag: "--quiet", desc: "Exit code 1 on critical/high findings (CI use)" },
              ]}
            />

            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">What gets scanned</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Secrets",
                    severity: "critical",
                    color: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40",
                    items: [
                      "AWS Access Keys (AKIA…)",
                      "GitHub tokens (ghp_…)",
                      "OpenAI keys (sk-…)",
                      "Stripe live keys (sk_live_…)",
                      "JWT secrets",
                      "DB URLs with credentials",
                      "Private key PEM blocks",
                      "Hardcoded passwords",
                    ],
                  },
                  {
                    label: "Unsafe patterns",
                    severity: "high/medium",
                    color: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40",
                    items: [
                      "eval() usage",
                      "SQL string concatenation",
                      "Command injection via exec`...${}`",
                      "Math.random() for token generation",
                      "Prototype pollution (__proto__)",
                      "innerHTML / dangerouslySetInnerHTML",
                      "Unsafe JSON.parse on req.body",
                      "document.write",
                    ],
                  },
                ].map((g) => (
                  <div key={g.label} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{g.label}</p>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", g.color)}>
                        {g.severity}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {g.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-foreground-muted">
                          <div className="h-1 w-1 shrink-0 rounded-full bg-foreground-subtle" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Scoring model</p>
              <div className="space-y-1.5">
                {[
                  ["Secret found", "−20 per finding"],
                  ["Critical dependency CVE", "−15 per CVE"],
                  ["High dependency CVE", "−8 per CVE"],
                  ["High code pattern", "−8 per finding"],
                  ["Moderate CVE / Medium pattern", "−3–4 per finding"],
                  ["Exposed .env file", "−10 per file"],
                ].map(([label, penalty]) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">{label}</span>
                    <code className="font-mono text-red-500">{penalty}</code>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── init ── */}
          <section id="init" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="init" icon={Settings} title="onboardai init" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Interactive environment setup wizard. Validates your runtime, installs dependencies,
              copies <code className="rounded bg-background-muted px-1 font-mono text-xs">.env.example</code> to{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">.env.local</code>,
              and installs a git pre-commit security hook.
            </p>
            <CodeBlock code={`onboardai init

# Force the full interactive wizard (role, team, VS Code settings)
onboardai init --interactive`} />
            <FlagTable
              flags={[
                { flag: "--interactive", desc: "Run the full interactive setup wizard", default: "false" },
              ]}
            />
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">What init does</p>
              <ol className="mt-2 space-y-1">
                {[
                  "Validates Node.js ≥ 18 and npm",
                  "Runs npm install if node_modules is missing",
                  "Copies .env.example → .env.local",
                  "Reports missing / empty env keys",
                  "Installs pre-commit hook that runs security --quiet",
                  "Optionally configures role, team, VS Code settings",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-foreground-muted">
                    <span className="mt-px shrink-0 font-mono text-foreground-subtle">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── status ── */}
          <section id="status" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="status" icon={CheckCircle2} title="onboardai status" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Full environment health check — runtime, dependencies, env config, ports, and git state.
              Zero flags needed.
            </p>
            <CodeBlock code="onboardai status" />
            <TerminalPreview
              lines={[
                { text: "$ onboardai status", color: "text-white/90" },
                { text: "" },
                { text: "  🔍 OnboardAI — Environment Health Check", color: "text-white" },
                { text: "" },
                { text: "  ── Project ──", color: "text-white/40" },
                { text: "  Project       my-saas-app", color: "text-white/70" },
                { text: "  Git commits   42  ✓", color: "text-emerald-400" },
                { text: "" },
                { text: "  ── Runtime ──", color: "text-white/40" },
                { text: "  Node.js       v20.11.0  [OK]", color: "text-emerald-400" },
                { text: "  npm           v10.2.4   [OK]", color: "text-emerald-400" },
                { text: "" },
                { text: "  ── Environment ──", color: "text-white/40" },
                { text: "  Configured    11/12  [Incomplete]", color: "text-yellow-400" },
                { text: "  Missing keys  OPENAI_API_KEY", color: "text-yellow-400" },
                { text: "" },
                { text: "  ⚠ 1 issue found:", color: "text-yellow-400" },
                { text: "  • Missing env keys: OPENAI_API_KEY", color: "text-white/50" },
              ]}
            />
          </section>

          {/* ── fix ── */}
          <section id="fix" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="fix" icon={Wrench} title="onboardai fix" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Auto-fixes common environment issues. Specify one or more targets.
            </p>
            <CodeBlock code={`onboardai fix --vulnerabilities   # Run npm audit fix
onboardai fix --env               # Fill missing .env.local keys
onboardai fix --ports             # Free blocked ports 3000 / 5432
onboardai fix --all               # Run all fixes`} />
            <FlagTable
              flags={[
                { flag: "--vulnerabilities", desc: "Runs npm audit fix to resolve fixable CVEs" },
                { flag: "--env", desc: "Copies missing keys from .env.example into .env.local (values left empty)" },
                { flag: "--ports", desc: "Interactively kills processes blocking ports 3000 and 5432" },
                { flag: "--all", desc: "Runs all three fixes in sequence" },
              ]}
            />
          </section>

          {/* ── monitor ── */}
          <section id="monitor" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="monitor" icon={Bell} title="onboardai monitor" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Continuously streams live web events from your connected app to your terminal.
              With <code className="rounded bg-background-muted px-1 font-mono text-xs">--ai</code>,
              errors are automatically analyzed by GPT-4o mini — explaining what happened, the root cause,
              and exactly where to fix it.
            </p>
            <CodeBlock code={`# Monitor first connected repo
onboardai monitor --api-key YOUR_KEY

# Monitor with AI analysis on every error
onboardai monitor --ai --api-key YOUR_KEY

# Monitor a specific repo, poll every 5 seconds
onboardai monitor --repo REPO_ID --interval 5 --ai`} />
            <FlagTable
              flags={[
                { flag: "--repo <repoId>", desc: "Repo ID to monitor", default: "First connected repo" },
                { flag: "--interval <seconds>", desc: "Polling interval (minimum: 5s)", default: "10" },
                { flag: "--ai", desc: "Auto-analyze errors with AI as they arrive", default: "false" },
                { flag: "--api-key <key>", desc: "API key (saved after first use)" },
              ]}
            />

            <TerminalPreview
              lines={[
                { text: "  ◉ OnboardAI Monitor", color: "text-white" },
                { text: "  Polling every 10s  ·  AI analysis: ON  ·  Ctrl+C to stop", color: "text-white/30" },
                { text: "" },
                { text: "  ✗ [ERROR] TypeError: Cannot read properties of undefined  components/Feed.tsx:47  14:23:07", color: "text-red-400" },
                { text: "" },
                { text: "  ✦ AI Analysis", color: "text-cyan-400" },
                { text: "  ─────────────────────────────────────────", color: "text-white/20" },
                { text: "  Confidence: high", color: "text-emerald-400" },
                { text: "" },
                { text: "  What happened:", color: "text-white/60" },
                { text: "  API returned null instead of an array before .map() was called", color: "text-white/80" },
                { text: "" },
                { text: "  Where to fix:", color: "text-white/60" },
                { text: "  src/components/Feed.tsx:47", color: "text-cyan-400" },
                { text: "" },
                { text: "  How to fix:", color: "text-white/60" },
                { text: "  → Use optional chaining: (data?.items ?? []).map(...)", color: "text-white/80" },
              ]}
            />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Event types</p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background-muted/60">
                      <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Type</th>
                      <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Icon</th>
                      <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "error", icon: "✗", color: "text-red-500", desc: "Unhandled JavaScript exceptions" },
                      { type: "api_error", icon: "✗", color: "text-red-500", desc: "Failed fetch / XHR requests" },
                      { type: "warning", icon: "⚠", color: "text-yellow-500", desc: "console.warn calls and soft failures" },
                      { type: "page_view", icon: "→", color: "text-blue-500", desc: "Page navigation events" },
                      { type: "performance", icon: "⚡", color: "text-purple-500", desc: "LCP, FID, and custom timing marks" },
                      { type: "info", icon: "ℹ", color: "text-gray-400", desc: "Informational events" },
                    ].map((e, i) => (
                      <tr key={e.type} className={cn("border-b border-border last:border-0", i % 2 === 0 ? "" : "bg-background-subtle/50")}>
                        <td className="px-4 py-2.5"><code className="font-mono text-foreground">{e.type}</code></td>
                        <td className={cn("px-4 py-2.5 font-mono", e.color)}>{e.icon}</td>
                        <td className="px-4 py-2.5 text-foreground-muted">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── sync ── */}
          <section id="sync" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="sync" icon={Zap} title="onboardai sync" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Syncs your local onboarding progress — Node version, dependencies, env config,
              git commits, and security score — to the OnboardAI dashboard.
            </p>
            <CodeBlock code={`# First sync — provide your API key (saved for future use)
onboardai sync --api-key YOUR_KEY

# Subsequent syncs
onboardai sync`} />
            <FlagTable
              flags={[
                { flag: "--api-key <key>", desc: "Your OnboardAI API key (stored after first use)" },
              ]}
            />
            <Callout type="tip">
              Get your API key from <strong>Settings → API</strong> in the dashboard.
              Once saved, <code className="font-mono">onboardai sync</code> requires no flags.
            </Callout>
          </section>

          {/* ── report / share ── */}
          <section id="report-share" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="report-share" icon={FileText} title="onboardai report / share" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">onboardai report</p>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Generates an onboarding progress report and optionally emails it to a recipient.
                </p>
                <CodeBlock code={`onboardai report
onboardai report --send-to manager@company.com`} />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">onboardai share</p>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Generates a shareable Markdown context summary — useful for async handoffs and pull request descriptions.
                </p>
                <CodeBlock code={`onboardai share
onboardai share --context`} />
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* ══════════════════ GUIDES ══════════════════ */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Guides
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">How-to guides</h2>
          </div>

          {/* ── Watch mode ── */}
          <section id="watch-mode" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="watch-mode" icon={Eye} title="Watch mode" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Watches <code className="rounded bg-background-muted px-1 font-mono text-xs">src/</code>,{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">app/</code>,{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">lib/</code>,{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">pages/</code>, and{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">api/</code> and re-runs
              the scan on every <code className="rounded bg-background-muted px-1 font-mono text-xs">.ts/.tsx/.js/.jsx/.env</code> save.
              500ms debounce. Terminal clears on each scan.
            </p>
            <CodeBlock code={`onboardai security --watch

# Stream JSON objects — one per scan — to a file
onboardai security --watch --output json >> scans.jsonl`} />
            <Callout type="info">
              Falls back to watching the project root if none of the standard source directories exist.
              Press <kbd className="rounded border border-primary/30 bg-primary-subtle px-1.5 py-0.5 font-mono text-xs">Ctrl+C</kbd> to stop.
            </Callout>
          </section>

          {/* ── JSON output ── */}
          <section id="json-output" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="json-output" icon={FileJson} title="JSON output" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Pass <code className="rounded bg-background-muted px-1 font-mono text-xs">--output json</code> to
              emit structured JSON — pipe it into scripts, monitoring systems, or <code className="rounded bg-background-muted px-1 font-mono text-xs">jq</code>.
            </p>
            <CodeBlock code={`# Pretty-print
onboardai security --output json

# Filter critical findings
onboardai security --output json | jq '.findings[] | select(.severity == "critical")'

# Count findings
onboardai security --output json | jq '.findings | length'`} />
            <CodeBlock language="json" title="Output schema" code={`{
  "score": 84,
  "findings": [
    {
      "file": "src/utils/parse.ts",
      "line": 42,
      "issue": "eval() usage",
      "severity": "high",
      "category": "code-pattern"
    }
  ],
  "dependencies": {
    "vulnerabilities": 2,
    "critical": 0,
    "high": 1,
    "moderate": 1,
    "low": 0
  },
  "scannedAt": "2026-04-20T14:23:07.000Z"
}`} />
          </section>

          {/* ── CI ── */}
          <section id="ci" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="ci" icon={GitBranch} title="CI integration" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              The <code className="rounded bg-background-muted px-1 font-mono text-xs">--quiet</code> flag
              exits with code <code className="rounded bg-background-muted px-1 font-mono text-xs">1</code> when
              critical or high findings are present — blocking the pipeline automatically.
            </p>
            <Steps
              steps={[
                {
                  label: "GitHub Actions workflow",
                  content: (
                    <CodeBlock
                      language="yaml"
                      title=".github/workflows/security.yml"
                      code={`name: Security Audit
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx onboardai security --quiet`}
                    />
                  ),
                },
                {
                  label: "Pre-commit git hook (manual)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock
                        language="bash"
                        title=".git/hooks/pre-commit"
                        code={`#!/bin/sh
npx onboardai security --quiet
if [ $? -ne 0 ]; then
  echo "Security issues found — fix before committing."
  exit 1
fi`}
                      />
                      <CodeBlock code="chmod +x .git/hooks/pre-commit" />
                    </div>
                  ),
                },
                {
                  label: "Auto-install the hook",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code="onboardai init" />
                      <p className="text-xs text-foreground-muted">
                        <code className="rounded bg-background-muted px-1 font-mono text-xs">init</code> installs
                        the pre-commit hook automatically — no manual chmod needed.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </section>

          {/* ── Dashboard ── */}
          <section id="dashboard" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="dashboard" icon={Zap} title="Dashboard sync" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Sync scan results to the OnboardAI web dashboard. Your team can track security posture,
              onboarding progress, and web events without leaving the browser.
            </p>
            <Steps
              steps={[
                {
                  label: "Get your API key from Settings → API",
                  content: (
                    <Callout type="tip">
                      Navigate to <strong>Settings → API tab</strong> in the dashboard.
                      Your API key is masked — click the copy icon to copy it.
                    </Callout>
                  ),
                },
                {
                  label: "First sync — save the key",
                  content: <CodeBlock code="onboardai sync --api-key YOUR_KEY" />,
                },
                {
                  label: "Future syncs — key is stored automatically",
                  content: <CodeBlock code="onboardai sync" />,
                },
                {
                  label: "Scan and sync in one pipeline",
                  content: <CodeBlock code="onboardai security --output json | onboardai sync" />,
                },
              ]}
            />
          </section>

          {/* ── Web events ── */}
          <section id="events" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="events" icon={Bell} title="Web event monitoring" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Install the tracking snippet in your app, then use{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">onboardai monitor</code>{" "}
              to stream live events to your terminal with optional AI analysis.
            </p>
            <Steps
              steps={[
                {
                  label: "Add the tracking snippet to your app",
                  content: (
                    <CodeBlock
                      language="typescript"
                      title="Paste in your app's <head> or layout.tsx"
                      code={`// Vanilla JS — paste in <head>
<script>
  (function(r,k){
    window.onerror=function(m,f,l){
      navigator.sendBeacon('/api/events/ingest',JSON.stringify({
        repoId:r,type:'error',message:m,filename:f,lineno:l,url:location.href
      }));
    };
    window.onunhandledrejection=function(e){
      navigator.sendBeacon('/api/events/ingest',JSON.stringify({
        repoId:r,type:'error',message:String(e.reason),url:location.href
      }));
    };
  })('YOUR_REPO_ID','YOUR_API_KEY');
</script>`}
                    />
                  ),
                },
                {
                  label: "Start monitoring with AI",
                  content: <CodeBlock code="onboardai monitor --ai --api-key YOUR_KEY" />,
                },
                {
                  label: "Errors appear in your terminal with AI analysis",
                  content: (
                    <Callout type="info">
                      AI analysis uses the guide context from your connected repo (architecture overview and key modules)
                      to give precise, codebase-aware explanations — not generic error messages.
                    </Callout>
                  ),
                },
              ]}
            />
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Direct event ingestion API</p>
              <p className="text-xs text-foreground-muted">
                POST to <code className="rounded bg-background-muted px-1 font-mono text-xs">/api/events/ingest</code> from any code — server, browser, or CI pipeline.
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://your-app.com/api/events/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{"repoId":"REPO_ID","type":"error","message":"TypeError: ...","url":"/"}'`}
              />
            </div>
          </section>

          <hr className="border-border" />

          {/* ══════════════════ PUBLISHING ══════════════════ */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Publishing
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Deployment</h2>
          </div>

          {/* ── Local dev ── */}
          <section id="local-dev" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="local-dev" icon={Wrench} title="Local development" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              Test the CLI locally before publishing. Use{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npm link</code> to symlink
              the binary into your global PATH — no publish needed.
            </p>
            <Steps
              steps={[
                {
                  label: "Install CLI dependencies",
                  content: <CodeBlock code={`cd cli\nnpm install`} />,
                },
                {
                  label: "Build",
                  content: <CodeBlock code={`npm run build\n# Compiles src/ → dist/ via tsc`} />,
                },
                {
                  label: "Link globally",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code="npm link" />
                      <p className="text-xs text-foreground-muted">
                        Creates a symlink:{" "}
                        <code className="rounded bg-background-muted px-1 font-mono text-xs">~/.nvm/…/bin/onboardai → cli/dist/index.js</code>
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Test from any directory",
                  content: <CodeBlock code={`cd ~/some-other-project\nonboardai security`} />,
                },
                {
                  label: "Rebuild on changes (in a second terminal)",
                  content: <CodeBlock code={`cd /path/to/cli\nnpx tsc --watch`} />,
                },
                {
                  label: "Unlink when done",
                  content: <CodeBlock code={`cd cli\nnpm unlink`} />,
                },
              ]}
            />
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                Skip the build with ts-node
              </p>
              <p className="text-xs text-foreground-muted">
                During active development you can skip the build step entirely:
              </p>
              <CodeBlock code={`cd cli\nnpx ts-node src/index.ts security --watch`} />
            </div>
          </section>

          {/* ── npm publish ── */}
          <section id="npm-publish" className="scroll-mt-20 space-y-6">
            <SectionAnchor id="npm-publish" icon={Upload} title="Publish to npm" badge="Hosting" />
            <p className="text-sm leading-relaxed text-foreground-muted">
              To make the CLI installable via{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npm install -g onboardai</code>,
              publish it to the npm registry following these steps exactly.
            </p>
            <Steps
              steps={[
                {
                  label: "Verify the shebang is on line 1 of cli/src/index.ts",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock language="typescript" code={`#!/usr/bin/env node`} />
                      <p className="text-xs text-foreground-muted">
                        Without this line, npm will install the binary but Node won't know how to execute it.
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Check cli/package.json has the correct bin entry",
                  content: (
                    <CodeBlock
                      language="json"
                      code={`{
  "name": "onboardai",
  "version": "1.0.0",
  "bin": { "onboardai": "./dist/index.js" },
  "files": ["dist", "README.md"]
}`}
                    />
                  ),
                },
                {
                  label: "Build the CLI",
                  content: <CodeBlock code={`cd cli\nnpm run build`} />,
                },
                {
                  label: "Create an npm account (if needed)",
                  content: <CodeBlock code="npm adduser" />,
                },
                {
                  label: "Log in to npm",
                  content: <CodeBlock code="npm login" />,
                },
                {
                  label: "Dry-run to verify what will be published",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`cd cli\nnpm publish --dry-run`} />
                      <Callout type="warning">
                        Confirm the output only lists <code className="font-mono">dist/</code> and{" "}
                        <code className="font-mono">README.md</code> — never{" "}
                        <code className="font-mono">src/</code> or <code className="font-mono">.env</code> files.
                      </Callout>
                    </div>
                  ),
                },
                {
                  label: "Publish",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`cd cli\nnpm publish --access public`} />
                      <p className="text-xs text-foreground-muted">
                        <code className="rounded bg-background-muted px-1 font-mono text-xs">--access public</code>{" "}
                        is required for scoped packages like{" "}
                        <code className="rounded bg-background-muted px-1 font-mono text-xs">@yourname/onboardai</code>.
                        Unscoped packages are public by default.
                      </p>
                    </div>
                  ),
                },
              ]}
            />

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Releasing a new version
              </p>
              <CodeBlock code={`# Patch: 1.0.0 → 1.0.1
npm version patch --prefix cli

# Minor: 1.0.0 → 1.1.0
npm version minor --prefix cli

# Major: 1.0.0 → 2.0.0
npm version major --prefix cli

# Build and publish
cd cli && npm run build && npm publish`} />
            </div>

            <Callout type="warning">
              <strong>Name conflicts:</strong> if <code className="font-mono">onboardai</code> is already taken
              on npm, scope it as <code className="font-mono">@your-username/onboardai</code> and update the{" "}
              <code className="font-mono">name</code> and <code className="font-mono">bin</code> fields in{" "}
              <code className="font-mono">cli/package.json</code> accordingly.
            </Callout>
          </section>

          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "oklch(0.546 0.243 264.4)" }}
              >
                <GitBranch className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">OnboardAI CLI</p>
                <p className="text-xs text-foreground-muted">MIT License · v1.0.0</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/security", label: "Security" },
                { href: "/analytics", label: "Analytics" },
                { href: "/events", label: "Events" },
                { href: "/sign-in", label: "Sign in" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1 text-xs text-foreground-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
