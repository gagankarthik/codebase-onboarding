"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FolderTree,
  Layers,
  BarChart2,
  ArrowLeft,
  RefreshCw,
  FileCode,
  Package,
  FlaskConical,
  Settings2,
  Cloud,
  Database,
  Zap,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatRelativeTime } from "@/lib/utils"
import type { CodebaseAnalysis, TechStackEntry } from "@/types"

const CATEGORY_ICON: Record<TechStackEntry["category"], typeof FileCode> = {
  language: FileCode,
  framework: Layers,
  tool: Zap,
  database: Database,
  cloud: Cloud,
  testing: FlaskConical,
}

const CATEGORY_COLOR: Record<TechStackEntry["category"], string> = {
  language: "text-primary bg-primary-subtle border-primary/20",
  framework: "text-success bg-success-subtle border-success/20",
  tool: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
  database: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900",
  cloud: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900",
  testing: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof BarChart2
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-foreground-muted">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-foreground-muted">{sub}</p>}
    </div>
  )
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate font-mono text-xs text-foreground-muted" title={label}>
        {label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-background-muted">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-foreground-muted">{value}</span>
    </div>
  )
}

export default function AnalysisPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<CodebaseAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/repos/${repoId}/analysis`)
      const data = await res.json() as { analysis: CodebaseAnalysis | null }
      setAnalysis(data.analysis)
    } catch {
      toast.error("Failed to load analysis.")
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis() {
    setRunning(true)
    try {
      const res = await fetch(`/api/repos/${repoId}/analysis`, { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json() as { analysis: CodebaseAnalysis }
      setAnalysis(data.analysis)
      toast.success("Codebase analyzed successfully.")
    } catch {
      toast.error("Analysis failed. Check that the repo is connected.")
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => { load() }, [repoId])

  const maxDir = Math.max(...(analysis?.directoryTree.map((d) => d.fileCount) ?? [1]))
  const maxFile = Math.max(...(analysis?.complexity.largestFiles.map((f) => f.lines) ?? [1]))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Codebase Analysis"
        subtitle="Structure overview, tech stack detection, and complexity metrics"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
            <Button size="sm" onClick={runAnalysis} disabled={running}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
              {running ? "Analyzing…" : analysis ? "Re-analyze" : "Run Analysis"}
            </Button>
          </div>
        }
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !analysis && (
        <EmptyState
          icon={FolderTree}
          heading="No analysis yet"
          description="Run your first analysis to see structure overview, tech stack, and complexity metrics."
          action={{ label: running ? "Analyzing…" : "Run Analysis", onClick: runAnalysis }}
        />
      )}

      {analysis && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <p className="text-xs text-foreground-muted">
            Last analyzed {formatRelativeTime(analysis.analyzedAt)}
          </p>

          {/* Complexity metrics */}
          <motion.div variants={fadeInUp}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart2 className="h-4 w-4 text-primary" />
              Complexity Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={FileCode} label="Total files" value={analysis.complexity.totalFiles.toLocaleString()} />
              <MetricCard icon={BarChart2} label="Total lines" value={analysis.complexity.totalLines.toLocaleString()} sub={`~${analysis.complexity.avgFileSizeLines} avg per file`} />
              <MetricCard icon={Package} label="Dependencies" value={analysis.complexity.dependencyCount} />
              <MetricCard icon={FlaskConical} label="Test files" value={analysis.complexity.testFileCount} sub={`${analysis.complexity.configFileCount} config files`} />
            </div>
          </motion.div>

          {/* Tech stack */}
          <motion.div variants={fadeInUp}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Layers className="h-4 w-4 text-primary" />
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {analysis.techStack.map((entry) => {
                const Icon = CATEGORY_ICON[entry.category]
                return (
                  <div
                    key={entry.name}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${CATEGORY_COLOR[entry.category]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {entry.name}
                    {entry.version && (
                      <span className="opacity-60">v{entry.version}</span>
                    )}
                  </div>
                )
              })}
              {analysis.techStack.length === 0 && (
                <p className="text-xs text-foreground-muted">No tech stack detected.</p>
              )}
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Directory breakdown */}
            <motion.div variants={fadeInUp}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FolderTree className="h-4 w-4 text-primary" />
                Directory Breakdown
                <span className="ml-auto text-xs font-normal text-foreground-muted">files</span>
              </h2>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                {analysis.directoryTree.slice(0, 12).map((dir) => (
                  <BarRow key={dir.path} label={dir.path} value={dir.fileCount} max={maxDir} />
                ))}
                {analysis.directoryTree.length === 0 && (
                  <p className="text-xs text-foreground-muted">No directories found.</p>
                )}
              </div>
            </motion.div>

            {/* Largest files */}
            <motion.div variants={fadeInUp}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileCode className="h-4 w-4 text-primary" />
                Largest Files
                <span className="ml-auto text-xs font-normal text-foreground-muted">lines</span>
              </h2>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                {analysis.complexity.largestFiles.map((f) => (
                  <BarRow key={f.path} label={f.path} value={f.lines} max={maxFile} />
                ))}
                {analysis.complexity.largestFiles.length === 0 && (
                  <p className="text-xs text-foreground-muted">No files sampled.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Entry points */}
          {analysis.entryPoints.length > 0 && (
            <motion.div variants={fadeInUp}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Entry Points
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.entryPoints.map((ep) => (
                  <div
                    key={ep}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background-muted px-3 py-1.5 font-mono text-xs text-foreground"
                  >
                    <ChevronRight className="h-3 w-3 text-primary" />
                    {ep}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
