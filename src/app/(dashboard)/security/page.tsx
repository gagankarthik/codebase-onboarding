"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronRight,
  FileCode,
  Lock,
  Package,
  GitBranch,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatRelativeTime } from "@/lib/utils"
import type { Repo, SecurityScan, SecurityFinding } from "@/types"

export const metadata = { title: "Security — Codebase" }

type SeverityLevel = "critical" | "high" | "medium" | "low"

const SEVERITY_META: Record<
  SeverityLevel,
  { label: string; color: string; bg: string; icon: typeof AlertOctagon }
> = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", icon: AlertOctagon },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", icon: ShieldAlert },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", icon: AlertTriangle },
  low: { label: "Low", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: Info },
}

const CATEGORY_ICON: Record<SecurityFinding["category"], typeof FileCode> = {
  secret: Lock,
  "code-pattern": FileCode,
  dependency: Package,
  env: GitBranch,
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : score >= 50 ? "text-orange-500" : "text-red-500"
  const label = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs work"

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-5xl font-bold tracking-tight ${color}`}>{score}</div>
      <div className="text-xs text-foreground-muted">/ 100</div>
      <Badge
        variant="outline"
        className={`mt-1 text-xs ${color} border-current`}
      >
        {label}
      </Badge>
    </div>
  )
}

function SeverityCard({
  severity,
  count,
}: {
  severity: SeverityLevel
  count: number
}) {
  const meta = SEVERITY_META[severity]
  const Icon = meta.icon

  return (
    <div className={`rounded-xl border border-border p-4 ${count > 0 ? meta.bg : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${count > 0 ? meta.color : "text-foreground-muted"}`} />
          <span className={`text-xs font-medium ${count > 0 ? meta.color : "text-foreground-muted"}`}>
            {meta.label}
          </span>
        </div>
        <span className={`text-2xl font-bold ${count > 0 ? meta.color : "text-foreground"}`}>{count}</span>
      </div>
    </div>
  )
}

function FindingGroup({
  severity,
  findings,
}: {
  severity: SeverityLevel
  findings: SecurityFinding[]
}) {
  const [open, setOpen] = useState(true)
  const meta = SEVERITY_META[severity]
  const Icon = meta.icon

  if (findings.length === 0) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-background-subtle ${meta.bg}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.color}`} />
          <span className={`text-sm font-semibold ${meta.color}`}>
            {meta.label} severity
          </span>
          <Badge variant="secondary" className="text-xs">
            {findings.length}
          </Badge>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground-muted" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-border bg-card">
          {findings.map((finding, i) => {
            const CatIcon = CATEGORY_ICON[finding.category]
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <CatIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{finding.issue}</p>
                  <p className="mt-0.5 font-mono text-xs text-foreground-muted">
                    {finding.file}
                    <span className="ml-1 text-foreground-subtle">:{finding.line}</span>
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs capitalize">
                  {finding.category.replace("-", " ")}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SecurityPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState<string>("")
  const [scan, setScan] = useState<SecurityScan | null>(null)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [loadingScan, setLoadingScan] = useState(false)

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

  const loadScan = useCallback((repoId: string) => {
    if (!repoId) return
    setLoadingScan(true)
    fetch(`/api/security?repoId=${repoId}`)
      .then((r) => r.json())
      .then((d: { scan?: SecurityScan | null }) => setScan(d.scan ?? null))
      .catch(() => toast.error("Failed to load security scan."))
      .finally(() => setLoadingScan(false))
  }, [])

  useEffect(() => {
    if (selectedRepoId) loadScan(selectedRepoId)
  }, [selectedRepoId, loadScan])

  async function runScan() {
    if (!selectedRepoId) return
    setScanning(true)
    try {
      const res = await fetch("/api/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: selectedRepoId }),
      })
      if (!res.ok) throw new Error("Scan failed")
      const data = (await res.json()) as { scan: SecurityScan }
      setScan(data.scan)
      toast.success(`Scan complete — score: ${data.scan.score}/100`)
    } catch {
      toast.error("Security scan failed — check your GitHub connection and try again.")
    } finally {
      setScanning(false)
    }
  }

  const selectedRepo = repos.find((r) => r.repoId === selectedRepoId)

  const findingsBySeverity = {
    critical: scan?.findings.filter((f) => f.severity === "critical") ?? [],
    high: scan?.findings.filter((f) => f.severity === "high") ?? [],
    medium: scan?.findings.filter((f) => f.severity === "medium") ?? [],
    low: scan?.findings.filter((f) => f.severity === "low") ?? [],
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security"
        subtitle="Monitor your codebase for secrets, unsafe patterns, and vulnerabilities"
        actions={
          <div className="flex items-center gap-2">
            {repos.length > 1 && (
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {repos.map((r) => (
                  <option key={r.repoId} value={r.repoId}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            )}
            <Button
              size="sm"
              onClick={runScan}
              disabled={scanning || !selectedRepoId}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Run scan"}
            </Button>
          </div>
        }
      />

      {loadingRepos ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-background-muted" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <EmptyState
          icon={Shield}
          heading="No repos connected"
          description="Connect a GitHub repo to run your first security scan."
        />
      ) : loadingScan ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-background-muted" />
          ))}
        </div>
      ) : scan === null ? (
        <EmptyState
          icon={ShieldCheck}
          heading="No scan results yet"
          description={`Run your first security scan on ${selectedRepo?.fullName ?? "this repo"} to see results.`}
          action={{ label: "Run scan", onClick: runScan }}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Score + summary */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center"
          >
            <div className="flex flex-col items-center gap-2 sm:min-w-[120px]">
              <ScoreRing score={scan.score} />
            </div>
            <div className="h-px bg-border sm:h-auto sm:w-px" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedRepo?.fullName}
              </p>
              <p className="text-xs text-foreground-muted">
                Last scanned {formatRelativeTime(scan.scannedAt)} ·{" "}
                {scan.findings.length} finding{scan.findings.length !== 1 ? "s" : ""}
              </p>
              <p className="mt-2 text-xs text-foreground-muted">
                {scan.score >= 90
                  ? "Your codebase looks secure. Keep it up."
                  : scan.score >= 70
                  ? "A few issues to review before your next deployment."
                  : scan.score >= 50
                  ? "Several security concerns need attention."
                  : "Critical issues found — review immediately before merging."}
              </p>
            </div>
          </motion.div>

          {/* Severity breakdown */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {(["critical", "high", "medium", "low"] as SeverityLevel[]).map((s) => (
              <SeverityCard key={s} severity={s} count={findingsBySeverity[s].length} />
            ))}
          </motion.div>

          {/* Dependency vulnerabilities */}
          {scan.dependencyVulnerabilities.total > 0 && (
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  {scan.dependencyVulnerabilities.total} dependency vulnerabilities
                </span>
              </div>
              <p className="mt-1 text-xs text-orange-600 dark:text-orange-500">
                Run{" "}
                <code className="rounded bg-orange-100 px-1 font-mono dark:bg-orange-900/40">
                  onboardai fix --vulnerabilities
                </code>{" "}
                in your terminal to auto-fix these.
              </p>
            </motion.div>
          )}

          {/* Findings list */}
          <motion.div variants={fadeInUp} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Findings</h2>
            {scan.findings.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-success-subtle p-4">
                <ShieldCheck className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-semibold text-success">No issues found</p>
                  <p className="text-xs text-foreground-muted">
                    Your codebase passed all security checks.
                  </p>
                </div>
              </div>
            ) : (
              (["critical", "high", "medium", "low"] as SeverityLevel[]).map((severity) => (
                <FindingGroup
                  key={severity}
                  severity={severity}
                  findings={findingsBySeverity[severity]}
                />
              ))
            )}
          </motion.div>

          {/* CLI tip */}
          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-border bg-background-subtle p-4"
          >
            <p className="text-xs font-semibold text-foreground">Run continuous monitoring locally</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Use the CLI to watch your files in real-time and get instant feedback as you code.
            </p>
            <code className="mt-2 block rounded-lg bg-background-muted px-3 py-2 font-mono text-xs text-foreground">
              npx onboardai security --watch
            </code>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
