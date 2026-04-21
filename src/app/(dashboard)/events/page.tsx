"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertOctagon, AlertTriangle, Info, Activity, Eye, Wifi,
  WifiOff, Sparkles, Copy, Check, ChevronDown, ChevronRight,
  RefreshCw, Globe, Zap, BarChart3, Clock, FileCode,
  Bell, Plus, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatRelativeTime } from "@/lib/utils"
import type { Repo, WebEvent, EventAnalysis, WebEventType, AlertRule } from "@/types"

// ── Alert Rules panel ─────────────────────────────────────────────────────────

function AlertRulesPanel({ repoId }: { repoId: string }) {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    condition: "error_count" as AlertRule["condition"],
    threshold: "5",
    windowMinutes: "60",
    action: "log" as AlertRule["action"],
    actionTarget: "",
  })

  async function loadRules() {
    try {
      const res = await fetch(`/api/alert-rules?repoId=${repoId}`)
      const data = await res.json() as { rules: AlertRule[] }
      setRules(data.rules ?? [])
    } catch {
      toast.error("Failed to load alert rules.")
    } finally {
      setLoading(false)
    }
  }

  async function createRule() {
    if (!form.name.trim()) { toast.error("Rule name is required."); return }
    setCreating(true)
    try {
      const res = await fetch("/api/alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId,
          name: form.name,
          condition: form.condition,
          threshold: Number(form.threshold) || undefined,
          windowMinutes: Number(form.windowMinutes) || undefined,
          action: form.action,
          actionTarget: form.actionTarget || undefined,
          enabled: true,
        }),
      })
      if (!res.ok) throw new Error()
      await loadRules()
      setShowForm(false)
      setForm({ name: "", condition: "error_count", threshold: "5", windowMinutes: "60", action: "log", actionTarget: "" })
      toast.success("Alert rule created.")
    } catch {
      toast.error("Failed to create rule.")
    } finally {
      setCreating(false)
    }
  }

  async function toggleRule(ruleId: string, enabled: boolean) {
    await fetch(`/api/alert-rules/${ruleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    })
    setRules((rs) => rs.map((r) => r.ruleId === ruleId ? { ...r, enabled: !enabled } : r))
  }

  async function deleteRule(ruleId: string) {
    await fetch(`/api/alert-rules/${ruleId}`, { method: "DELETE" })
    setRules((rs) => rs.filter((r) => r.ruleId !== ruleId))
    toast.success("Alert rule deleted.")
  }

  useEffect(() => { if (repoId) loadRules() }, [repoId])

  const CONDITION_LABELS: Record<AlertRule["condition"], string> = {
    error_count: "Error count exceeds threshold",
    critical_error: "Any critical error",
    high_error_rate: "High error rate",
    new_error_type: "New error type seen",
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Alert Rules</span>
          {rules.length > 0 && (
            <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary">
              {rules.length}
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add rule
        </Button>
      </div>

      {showForm && (
        <div className="border-b border-border bg-background-subtle p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Rule name</Label>
              <Input className="h-8 text-xs" placeholder="Too many errors" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condition</Label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as AlertRule["condition"] }))}
              >
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Threshold (errors)</Label>
              <Input className="h-8 text-xs" type="number" min="1" value={form.threshold} onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Window (minutes)</Label>
              <Input className="h-8 text-xs" type="number" min="1" value={form.windowMinutes} onChange={(e) => setForm((f) => ({ ...f, windowMinutes: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value as AlertRule["action"] }))}
              >
                <option value="log">Log only</option>
                <option value="email">Email</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
            {(form.action === "email" || form.action === "webhook") && (
              <div className="space-y-1.5">
                <Label className="text-xs">{form.action === "email" ? "Email address" : "Webhook URL"}</Label>
                <Input className="h-8 text-xs" placeholder={form.action === "email" ? "you@company.com" : "https://hooks.example.com/..."} value={form.actionTarget} onChange={(e) => setForm((f) => ({ ...f, actionTarget: e.target.value }))} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={createRule} disabled={creating}>
              {creating ? "Creating…" : "Create rule"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-5 text-xs text-foreground-muted">Loading rules…</div>
        ) : rules.length === 0 ? (
          <div className="p-5 text-xs text-foreground-muted">
            No alert rules yet. Add a rule to get notified when error thresholds are reached.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.ruleId} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{rule.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${rule.enabled ? "bg-success-subtle text-success" : "bg-background-muted text-foreground-muted"}`}>
                    {rule.enabled ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-foreground-muted">
                  {CONDITION_LABELS[rule.condition]}
                  {rule.threshold ? ` · ≥ ${rule.threshold} in ${rule.windowMinutes}min` : ""}
                  {" · "}{rule.action}{rule.actionTarget ? ` → ${rule.actionTarget}` : ""}
                </p>
                {rule.lastTriggeredAt && (
                  <p className="mt-0.5 text-[10px] text-foreground-subtle">
                    Last triggered {formatRelativeTime(rule.lastTriggeredAt)} · {rule.triggeredCount}×
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleRule(rule.ruleId, rule.enabled)}
                  className="text-foreground-muted hover:text-foreground transition-colors"
                  title={rule.enabled ? "Pause rule" : "Activate rule"}
                >
                  {rule.enabled
                    ? <ToggleRight className="h-4 w-4 text-success" />
                    : <ToggleLeft className="h-4 w-4" />
                  }
                </button>
                <button
                  onClick={() => deleteRule(rule.ruleId)}
                  className="text-foreground-muted hover:text-destructive transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<WebEventType, { label: string; color: string; bg: string; icon: typeof AlertOctagon; dot: string }> = {
  error:       { label: "Error",       color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/30",    icon: AlertOctagon,  dot: "bg-red-500" },
  api_error:   { label: "API Error",   color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", icon: AlertTriangle, dot: "bg-orange-500" },
  warning:     { label: "Warning",     color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/30",  icon: AlertTriangle, dot: "bg-amber-500" },
  page_view:   { label: "Page View",   color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30",   icon: Eye,           dot: "bg-blue-400" },
  performance: { label: "Performance", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", icon: Zap,           dot: "bg-purple-500" },
  info:        { label: "Info",        color: "text-foreground-muted", bg: "bg-background-subtle",      icon: Info,          dot: "bg-foreground-muted" },
}

const FILTER_TABS: { key: WebEventType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "error", label: "Errors" },
  { key: "api_error", label: "API Errors" },
  { key: "warning", label: "Warnings" },
  { key: "page_view", label: "Page Views" },
  { key: "performance", label: "Performance" },
]

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-foreground-muted">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${value > 0 ? color : "text-foreground"}`}>{value}</span>
      </div>
    </div>
  )
}

function EventRow({ event, selected, onClick }: { event: WebEvent; selected: boolean; onClick: () => void }) {
  const meta = TYPE_META[event.type]
  const Icon = meta.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-background-subtle ${
        selected ? "bg-primary-subtle border-l-2 border-primary" : "border-l-2 border-transparent"
      }`}
    >
      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${meta.dot} ${event.type === "error" || event.type === "api_error" ? "animate-pulse" : ""}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          {event.analysis && (
            <Badge variant="secondary" className="text-xs py-0 gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-foreground">{event.message}</p>
        <p className="mt-0.5 text-xs text-foreground-muted">{formatRelativeTime(event.createdAt)}{event.url ? ` · ${new URL(event.url).pathname}` : ""}</p>
      </div>
    </button>
  )
}

function AnalysisPanel({
  event,
  onAnalyze,
  analyzing,
}: {
  event: WebEvent | null
  onAnalyze: (eventId: string) => void
  analyzing: boolean
}) {
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  if (!event) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background-muted">
          <Sparkles className="h-5 w-5 text-foreground-muted" />
        </div>
        <p className="text-sm font-medium text-foreground">Select an event to analyze</p>
        <p className="text-xs text-foreground-muted">
          Click any error event to see an AI-powered root cause analysis and fix suggestion
        </p>
      </div>
    )
  }

  const meta = TYPE_META[event.type]
  const analysis: EventAnalysis | undefined = event.analysis
  const isError = event.type === "error" || event.type === "api_error" || event.type === "warning"

  function copyFix() {
    if (!analysis) return
    navigator.clipboard.writeText(analysis.suggestedFix)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Event detail header */}
      <div className={`border-b border-border p-4 ${meta.bg}`}>
        <div className="flex items-center gap-2">
          <meta.icon className={`h-4 w-4 ${meta.color}`} />
          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          <span className="ml-auto text-xs text-foreground-muted">{formatRelativeTime(event.createdAt)}</span>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground leading-snug">{event.message}</p>
        {event.url && (
          <p className="mt-1 font-mono text-xs text-foreground-muted truncate">{event.url}</p>
        )}
        {(event.filename || event.lineno) && (
          <p className="mt-1 font-mono text-xs text-foreground-muted">
            {event.filename}{event.lineno ? `:${event.lineno}` : ""}
          </p>
        )}
      </div>

      {/* Stack trace */}
      {event.stack && (
        <div className="border-b border-border p-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Stack trace</p>
          <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--code-bg))] p-3 font-mono text-xs leading-5 text-foreground-muted whitespace-pre-wrap break-all">
            {event.stack.slice(0, 800)}{event.stack.length > 800 ? "\n…" : ""}
          </pre>
        </div>
      )}

      {/* AI Analysis */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">AI Analysis</span>
          </div>
          {isError && (
            <Button
              size="sm"
              variant={analysis ? "outline" : "default"}
              onClick={() => onAnalyze(event.eventId)}
              disabled={analyzing}
              className="h-7 text-xs"
            >
              {analyzing
                ? <><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Analyzing…</>
                : analysis
                ? <><RefreshCw className="mr-1 h-3 w-3" />Re-analyze</>
                : <><Sparkles className="mr-1 h-3 w-3" />Analyze with AI</>}
            </Button>
          )}
        </div>

        {analyzing && (
          <div className="rounded-xl border border-primary/20 bg-primary-subtle p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-foreground-muted">Reading code context and analyzing error…</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-primary/10">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "5%" }}
                animate={{ width: "85%" }}
                transition={{ duration: 8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {!analyzing && !analysis && isError && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-foreground-muted" />
            <p className="text-xs text-foreground-muted">
              Click <strong>Analyze with AI</strong> to get a root cause explanation and fix suggestion based on your codebase
            </p>
          </div>
        )}

        {!analyzing && analysis && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    analysis.confidence === "high" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400" :
                    analysis.confidence === "medium" ? "border-amber-300 text-amber-700 dark:text-amber-400" :
                    "border-border text-foreground-muted"
                  }
                >
                  {analysis.confidence} confidence
                </Badge>
                {event.analyzedAt && (
                  <span className="text-xs text-foreground-muted">
                    Analyzed {formatRelativeTime(event.analyzedAt)}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">What happened</p>
                  <p className="text-xs text-foreground-muted leading-relaxed">{analysis.explanation}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Root cause</p>
                  <p className="text-xs text-foreground-muted leading-relaxed">{analysis.rootCause}</p>
                </div>
                {(analysis.affectedFile || analysis.affectedLine) && (
                  <div className="border-t border-border pt-3 flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                    <code className="font-mono text-xs text-foreground">
                      {analysis.affectedFile}{analysis.affectedLine ? `:${analysis.affectedLine}` : ""}
                    </code>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">How to fix</p>
                  <button
                    onClick={copyFix}
                    className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {copiedSnippet ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">{analysis.suggestedFix}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {!isError && !analysis && (
          <p className="text-xs text-foreground-muted">AI analysis is available for errors, API errors, and warnings.</p>
        )}
      </div>
    </div>
  )
}

function SdkSnippet({ repoId }: { repoId: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const snippet = `// Add to your app's root layout or _app.tsx
import { useEffect } from "react"

function useOnboardAIMonitor() {
  useEffect(() => {
    const REPO_ID = "${repoId}"
    const API_KEY = process.env.NEXT_PUBLIC_ONBOARDAI_KEY ?? ""
    const ENDPOINT = "${typeof window !== "undefined" ? window.location.origin : ""}/api/events/ingest"

    function send(payload: object) {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ repoId: REPO_ID, ...payload }),
        keepalive: true,
      }).catch(() => {})
    }

    // JS errors
    const onError = (e: ErrorEvent) => send({
      type: "error", message: e.message,
      filename: e.filename, lineno: e.lineno, colno: e.colno,
      stack: e.error?.stack, url: window.location.href,
    })

    // Unhandled promise rejections
    const onUnhandled = (e: PromiseRejectionEvent) => send({
      type: "error", message: String(e.reason),
      stack: e.reason?.stack, url: window.location.href,
    })

    // Page views
    send({ type: "page_view", url: window.location.href, message: document.title })

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandled)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandled)
    }
  }, [])
}

export default function RootLayout({ children }) {
  useOnboardAIMonitor()
  return <>{children}</>
}`

  function copy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success("SDK snippet copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-background-subtle px-4 py-3 text-left hover:bg-background-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Browser SDK — add to your app</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-foreground-muted" /> : <ChevronRight className="h-4 w-4 text-foreground-muted" />}
      </button>
      {open && (
        <div>
          <div className="flex items-center justify-between border-t border-border bg-[hsl(var(--code-bg))] px-4 py-2">
            <span className="text-xs text-foreground-muted">TypeScript · React</span>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors">
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto bg-[hsl(var(--code-bg))] px-4 pb-4 pt-2 font-mono text-xs leading-5 text-foreground">
            <code>{snippet}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState("")
  const [events, setEvents] = useState<WebEvent[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [selectedEvent, setSelectedEvent] = useState<WebEvent | null>(null)
  const [filter, setFilter] = useState<WebEventType | "all">("all")
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load repos
  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((d: { repos?: Repo[] }) => {
        const r = d.repos ?? []
        setRepos(r)
        if (r.length > 0) setSelectedRepoId(r[0].repoId)
      })
      .catch(() => toast.error("Failed to load repositories."))
      .finally(() => setLoadingRepos(false))
  }, [])

  const fetchEvents = useCallback(
    async (repoId: string, silent = false) => {
      if (!repoId) return
      if (!silent) setLoadingEvents(true)
      try {
        const [eventsRes, statsRes] = await Promise.all([
          fetch(`/api/events?repoId=${repoId}&limit=100`).then((r) => r.json()),
          fetch(`/api/events?repoId=${repoId}&stats=1`).then((r) => r.json()),
        ])
        const newEvents = (eventsRes.events ?? []) as WebEvent[]
        setEvents(newEvents)
        setStats(statsRes.stats ?? {})
        setLastUpdated(new Date())

        // Update selected event if it was re-analyzed
        setSelectedEvent((prev) => {
          if (!prev) return prev
          return newEvents.find((e) => e.eventId === prev.eventId) ?? prev
        })
      } catch {
        if (!silent) toast.error("Failed to load events.")
      } finally {
        setLoadingEvents(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedRepoId) fetchEvents(selectedRepoId)
  }, [selectedRepoId, fetchEvents])

  // Auto-refresh polling
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (autoRefresh && selectedRepoId) {
      pollRef.current = setInterval(() => {
        fetchEvents(selectedRepoId, true)
      }, 10_000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [autoRefresh, selectedRepoId, fetchEvents])

  async function analyzeSelectedEvent(eventId: string) {
    setAnalyzing(true)
    try {
      const res = await fetch("/api/events/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { analysis: EventAnalysis }

      // Patch the event in both states
      const patchEvent = (e: WebEvent) =>
        e.eventId === eventId ? { ...e, analysis: data.analysis, analyzedAt: new Date().toISOString() } : e

      setEvents((prev) => prev.map(patchEvent))
      setSelectedEvent((prev) => (prev?.eventId === eventId ? patchEvent(prev) : prev))
      toast.success("Analysis complete")
    } catch {
      toast.error("AI analysis failed — try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredEvents = filter === "all"
    ? events
    : events.filter((e) => e.type === filter)

  const selectedRepo = repos.find((r) => r.repoId === selectedRepoId)

  return (
    <div className="flex h-full flex-col space-y-6">
      <PageHeader
        title="Monitor"
        subtitle="Real-time web events, analytics, and AI-powered error analysis"
        actions={
          <div className="flex items-center gap-2">
            {repos.length > 1 && (
              <select
                value={selectedRepoId}
                onChange={(e) => { setSelectedRepoId(e.target.value); setSelectedEvent(null) }}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {repos.map((r) => (
                  <option key={r.repoId} value={r.repoId}>{r.fullName}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                autoRefresh
                  ? "border-success/30 bg-success-subtle text-success"
                  : "border-border bg-card text-foreground-muted hover:text-foreground"
              }`}
            >
              {autoRefresh ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {autoRefresh ? "Live" : "Paused"}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents(selectedRepoId)}
              disabled={loadingEvents}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {loadingRepos ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-background-muted" />)}
        </div>
      ) : repos.length === 0 ? (
        <EmptyState icon={Activity} heading="No repos connected" description="Connect a GitHub repo to start monitoring web events." />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-6">
          {/* Stats row */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={AlertOctagon} label="Errors"       value={stats.error ?? 0}       color="text-red-600" />
            <StatCard icon={AlertTriangle} label="API Errors"  value={stats.api_error ?? 0}   color="text-orange-600" />
            <StatCard icon={AlertTriangle} label="Warnings"    value={stats.warning ?? 0}     color="text-amber-600" />
            <StatCard icon={Eye}           label="Page Views"  value={stats.page_view ?? 0}   color="text-blue-600" />
            <StatCard icon={Zap}           label="Performance" value={stats.performance ?? 0} color="text-purple-600" />
            <StatCard icon={BarChart3}     label="Info"        value={stats.info ?? 0}        color="text-foreground-muted" />
          </motion.div>

          {/* Two-panel layout */}
          <motion.div variants={fadeInUp} className="flex gap-4" style={{ height: "calc(100vh - 340px)", minHeight: 400 }}>
            {/* Left: event stream */}
            <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card overflow-hidden lg:w-80">
              {/* Filter tabs */}
              <div className="flex overflow-x-auto border-b border-border bg-background-subtle px-2 pt-2 gap-1 scrollbar-none">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      filter === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground-muted hover:text-foreground hover:bg-background-muted"
                    }`}
                  >
                    {tab.label}
                    {tab.key !== "all" && (stats[tab.key] ?? 0) > 0 && (
                      <span className="ml-1 opacity-70">{stats[tab.key]}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                <span className="text-xs text-foreground-muted">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                </span>
                {lastUpdated && (
                  <div className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(lastUpdated.toISOString())}
                  </div>
                )}
              </div>

              {/* Events list */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {loadingEvents && filteredEvents.length === 0 && (
                  <div className="space-y-0">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-background-muted" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-16 animate-pulse rounded bg-background-muted" />
                          <div className="h-3 w-full animate-pulse rounded bg-background-muted" />
                          <div className="h-2.5 w-24 animate-pulse rounded bg-background-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loadingEvents && filteredEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                    <Activity className="h-6 w-6 text-foreground-muted" />
                    <p className="text-xs font-medium text-foreground">No events yet</p>
                    <p className="text-xs text-foreground-muted">
                      Add the browser SDK to your app to start capturing events
                    </p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <EventRow
                        event={event}
                        selected={selectedEvent?.eventId === event.eventId}
                        onClick={() => setSelectedEvent(event)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: AI analysis panel */}
            <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-background-subtle px-4 py-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Analysis</span>
                <Badge variant="secondary" className="ml-auto text-xs">Powered by GPT-4o mini</Badge>
              </div>
              <div className="h-[calc(100%-45px)]">
                <AnalysisPanel
                  event={selectedEvent}
                  onAnalyze={analyzeSelectedEvent}
                  analyzing={analyzing}
                />
              </div>
            </div>
          </motion.div>

          {/* Alert rules + SDK snippet */}
          {selectedRepo && (
            <>
              <motion.div variants={fadeInUp}>
                <AlertRulesPanel repoId={selectedRepo.repoId} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SdkSnippet repoId={selectedRepo.repoId} />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
