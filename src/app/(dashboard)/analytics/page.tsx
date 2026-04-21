"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Users, Eye, TrendingDown, Clock, Monitor, Smartphone, Tablet,
  Copy, Check, Globe, ArrowUpRight, RefreshCw, Wifi, ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { fmtDuration } from "@/lib/analytics/aggregate"
import type { Repo, AnalyticsSummary, AnalyticsTimeSeries } from "@/types"

type Period = "today" | "7d" | "30d"

// ── chart ─────────────────────────────────────────────────────────────────────

function AreaChart({ data }: { data: AnalyticsTimeSeries[] }) {
  const W = 1000
  const H = 200
  const PAD = { t: 16, r: 8, b: 40, l: 44 }
  const cW = W - PAD.l - PAD.r
  const cH = H - PAD.t - PAD.b

  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-background-muted">
        <p className="text-xs text-foreground-muted">No data for this period</p>
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.views), 1)
  const n = data.length

  const xOf = (i: number) => PAD.l + (i / (n - 1)) * cW
  const yOf = (v: number) => PAD.t + cH - (v / maxVal) * cH

  const viewsLine = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.views)}`).join(" ")
  const visitorsLine = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.visitors)}`).join(" ")
  const viewsArea = `${viewsLine} L${xOf(n - 1)},${PAD.t + cH} L${PAD.l},${PAD.t + cH}Z`

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: yOf(maxVal * f), label: Math.round(maxVal * f).toString() }))

  // X-axis labels — show at most 8
  const step = Math.max(1, Math.floor(n / 8))
  const xLabels = data.filter((_, i) => i % step === 0 || i === n - 1)
    .map((d, _, arr) => ({ label: d.label, x: xOf(data.indexOf(d)) }))

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="hsl(220 13% 91%)" strokeWidth="1" />
            <text x={PAD.l - 6} y={t.y + 4} textAnchor="end" fontSize="11" fill="hsl(215 16% 47%)">{t.label}</text>
          </g>
        ))}

        {/* Area */}
        <path d={viewsArea} fill="url(#areaGrad)" />

        {/* Views line */}
        <path d={viewsLine} fill="none" stroke="hsl(243 75% 59%)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Visitors line */}
        <path d={visitorsLine} fill="none" stroke="hsl(37 91% 55%)" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" strokeLinecap="round" />

        {/* X labels */}
        {xLabels.map((l) => (
          <text key={l.x} x={l.x} y={H - 8} textAnchor="middle" fontSize="11" fill="hsl(215 16% 47%)">{l.label}</text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded" style={{ background: "hsl(243 75% 59%)" }} />
          <span className="text-xs text-foreground-muted">Page views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded border-t-2 border-dashed" style={{ borderColor: "hsl(37 91% 55%)" }} />
          <span className="text-xs text-foreground-muted">Visitors</span>
        </div>
      </div>
    </div>
  )
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, highlight = false,
}: {
  icon: typeof Users; label: string; value: string; sub?: string; highlight?: boolean
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-xl border border-border p-5 ${highlight ? "bg-primary-subtle" : "bg-card"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-foreground-muted">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-foreground-muted">{sub}</p>}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-primary/10" : "bg-background-muted"}`}>
          <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-foreground-muted"}`} />
        </div>
      </div>
    </motion.div>
  )
}

// ── top table ─────────────────────────────────────────────────────────────────

function TopTable({
  title, rows, colA, colB,
}: {
  title: string
  rows: { label: string; value: number; pct: number }[]
  colA: string
  colB: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-xs text-foreground-muted">{colB}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-foreground-muted">No data yet</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 px-4 py-2.5">
              <div className="relative flex-1 min-w-0">
                <div
                  className="absolute inset-y-0 left-0 rounded-sm bg-primary/6"
                  style={{ width: `${row.pct}%` }}
                />
                <span className="relative text-xs font-medium text-foreground truncate block py-0.5 pl-1">
                  {row.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-foreground">{row.value.toLocaleString()}</span>
                <span className="text-xs text-foreground-muted w-10 text-right">{row.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── breakdown bar ─────────────────────────────────────────────────────────────

function BreakdownBar({
  title, items, icon: Icon,
}: {
  title: string
  items: { label: string; count: number; pct: number }[]
  icon: typeof Monitor
}) {
  const COLORS = ["bg-primary", "bg-accent", "bg-success", "bg-destructive/70", "bg-purple-500", "bg-cyan-500"]

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-foreground-muted" />
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-foreground-muted">No data yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground">{item.pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-muted">
                <motion.div
                  className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── live widget ───────────────────────────────────────────────────────────────

function LiveWidget({ repoId }: { repoId: string }) {
  const [active, setActive] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!repoId) return
    const es = new EventSource(`/api/analytics/realtime?repoId=${repoId}`)
    esRef.current = es

    es.onopen = () => setConnected(true)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { active: number }
        setActive(data.active)
      } catch { /* ignore */ }
    }
    es.onerror = () => setConnected(false)

    return () => { es.close(); setConnected(false) }
  }, [repoId])

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 ${
      connected ? "border-success/30 bg-success-subtle" : "border-border bg-card"
    }`}>
      <div className="relative flex h-3 w-3 items-center justify-center">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${connected ? "bg-success" : "bg-foreground-muted"}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">
          {active === null ? "Connecting…" : (
            <><span className="text-lg font-bold">{active}</span> visitor{active !== 1 ? "s" : ""} right now</>
          )}
        </p>
        <p className="text-xs text-foreground-muted">{connected ? "Live · updates every 5s" : "Reconnecting…"}</p>
      </div>
      <Wifi className={`ml-auto h-4 w-4 ${connected ? "text-success" : "text-foreground-muted"}`} />
    </div>
  )
}

// ── tracking snippet ──────────────────────────────────────────────────────────

function TrackingSnippet({ repoId }: { repoId: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  const snippet = `<!-- OnboardAI Analytics — paste before </body> -->
<script>
(function(){
  var R="${repoId}", E="${origin}/api/analytics/collect";
  var S=sessionStorage.getItem("_oa_s")||(Math.random().toString(36).slice(2)+Date.now().toString(36));
  sessionStorage.setItem("_oa_s",S);
  var t=Date.now(),pvId=null;

  function send(data){ fetch(E,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({repoId:R,sessionId:S},data)),keepalive:true}).then(function(r){return r.json()}).then(function(d){if(d.pvId)pvId=d.pvId}).catch(function(){}); }

  send({event:"pageview",pathname:location.pathname,referrer:document.referrer||undefined});

  window.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="hidden"&&pvId){
      send({event:"leave",pathname:location.pathname,duration:Math.round((Date.now()-t)/1000),pvId:pvId});
    }
  });
})();
</script>`

  function copy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success("Snippet copied")
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
          <span className="text-xs font-semibold text-foreground">Install tracking snippet</span>
          <Badge variant="secondary" className="text-xs">HTML / JS</Badge>
        </div>
        <span className="text-xs text-foreground-muted">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div>
          <p className="border-t border-border px-4 py-2 text-xs text-foreground-muted">
            Paste this before the <code className="rounded bg-background-muted px-1 font-mono">&lt;/body&gt;</code> tag of every page you want to track. Works with any HTML site, Next.js, Remix, etc.
          </p>
          <div className="border-t border-border">
            <div className="flex items-center justify-between bg-[hsl(var(--code-bg))] px-4 py-2">
              <span className="font-mono text-xs text-foreground-muted">HTML</span>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors">
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto bg-[hsl(var(--code-bg))] px-4 pb-4 pt-2 font-mono text-xs leading-5 text-foreground whitespace-pre-wrap">
              <code>{snippet}</code>
            </pre>
          </div>

          <div className="border-t border-border px-4 py-3">
            <p className="text-xs font-semibold text-foreground mb-2">React / Next.js hook</p>
            <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--code-bg))] p-3 font-mono text-xs leading-5 text-foreground">
              <code>{`import { useEffect } from "react"

export function useAnalytics() {
  useEffect(() => {
    const S = sessionStorage.getItem("_oa_s") ??
      (Math.random().toString(36).slice(2) + Date.now().toString(36))
    sessionStorage.setItem("_oa_s", S)
    let pvId: string | null = null
    const t = Date.now()

    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoId: "${repoId}",
        sessionId: S,
        event: "pageview",
        pathname: location.pathname,
        referrer: document.referrer || undefined,
      }),
    }).then(r => r.json()).then(d => { pvId = d.pvId })

    const onHide = () => {
      if (document.visibilityState === "hidden" && pvId) {
        navigator.sendBeacon("/api/analytics/collect", JSON.stringify({
          repoId: "${repoId}", sessionId: S, event: "leave",
          pathname: location.pathname,
          duration: Math.round((Date.now() - t) / 1000), pvId,
        }))
      }
    }
    document.addEventListener("visibilitychange", onHide)
    return () => document.removeEventListener("visibilitychange", onHide)
  }, [])
}`}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
]

export default function AnalyticsPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState("")
  const [period, setPeriod] = useState<Period>("7d")
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(true)

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

  const fetchSummary = useCallback(async (repoId: string, p: Period) => {
    if (!repoId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?repoId=${repoId}&period=${p}`)
      const data = await res.json() as { summary?: AnalyticsSummary }
      setSummary(data.summary ?? null)
    } catch {
      toast.error("Failed to load analytics.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRepoId) fetchSummary(selectedRepoId, period)
  }, [selectedRepoId, period, fetchSummary])

  const selectedRepo = repos.find((r) => r.repoId === selectedRepoId)
  const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Visitors, page views, bounce rate, and real-time traffic"
        actions={
          <div className="flex items-center gap-2">
            {repos.length > 1 && (
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {repos.map((r) => (
                  <option key={r.repoId} value={r.repoId}>{r.fullName}</option>
                ))}
              </select>
            )}
            <div className="flex rounded-lg border border-border bg-background overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === p.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground-muted hover:text-foreground hover:bg-background-subtle"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchSummary(selectedRepoId, period)} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {loadingRepos ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-background-muted" />)}
        </div>
      ) : repos.length === 0 ? (
        <EmptyState icon={Globe} heading="No repos connected" description="Connect a GitHub repo to start tracking analytics." />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">

          {/* Live widget */}
          <motion.div variants={fadeInUp}>
            <LiveWidget repoId={selectedRepoId} />
          </motion.div>

          {/* Stats row */}
          {loading && !summary ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-background-muted" />)}
            </div>
          ) : (
            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={Users}
                label="Unique visitors"
                value={fmtNum(summary?.uniqueVisitors ?? 0)}
                sub={PERIODS.find(p => p.key === period)?.label}
                highlight
              />
              <StatCard
                icon={Eye}
                label="Page views"
                value={fmtNum(summary?.pageViews ?? 0)}
                sub={`${summary ? (summary.pageViews / Math.max(summary.uniqueVisitors, 1)).toFixed(1) : "—"} per visitor`}
              />
              <StatCard
                icon={TrendingDown}
                label="Bounce rate"
                value={`${summary?.bounceRate ?? 0}%`}
                sub="Single-page sessions"
              />
              <StatCard
                icon={Clock}
                label="Avg. duration"
                value={summary ? fmtDuration(summary.avgDuration) : "—"}
                sub="Per session"
              />
            </motion.div>
          )}

          {/* Area chart */}
          <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">
              Traffic over time
              {loading && <RefreshCw className="ml-2 inline h-3.5 w-3.5 animate-spin text-foreground-muted" />}
            </p>
            <AreaChart data={summary?.timeSeries ?? []} />
          </motion.div>

          {/* Top pages + referrers */}
          <motion.div variants={fadeInUp} className="grid gap-4 lg:grid-cols-2">
            <TopTable
              title="Top pages"
              colA="Page"
              colB="Views"
              rows={(summary?.topPages ?? []).map((p) => ({ label: p.pathname, value: p.views, pct: p.pct }))}
            />
            <TopTable
              title="Top referrers"
              colA="Source"
              colB="Visits"
              rows={(summary?.topReferrers ?? []).map((r) => ({ label: r.referrer, value: r.visits, pct: r.pct }))}
            />
          </motion.div>

          {/* Device + browser breakdown */}
          <motion.div variants={fadeInUp} className="grid gap-4 lg:grid-cols-2">
            <BreakdownBar
              title="Device type"
              icon={Monitor}
              items={summary?.deviceBreakdown ?? []}
            />
            <BreakdownBar
              title="Browser"
              icon={Globe}
              items={summary?.browserBreakdown ?? []}
            />
          </motion.div>

          {/* Tracking snippet */}
          {selectedRepo && (
            <motion.div variants={fadeInUp}>
              <TrackingSnippet repoId={selectedRepo.repoId} />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
