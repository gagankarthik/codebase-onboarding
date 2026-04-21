"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GitCommit,
  Users,
  FileCode,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Plus,
  Minus,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatRelativeTime } from "@/lib/utils"
import type { RepoGitHubAnalytics } from "@/types"

function CommitChart({ weeks }: { weeks: RepoGitHubAnalytics["weeklyCommits"] }) {
  const max = Math.max(...weeks.map((w) => w.total), 1)
  return (
    <div className="flex h-20 items-end gap-0.5">
      {weeks.map((w) => {
        const pct = Math.round((w.total / max) * 100)
        return (
          <div
            key={w.week}
            title={`Week of ${new Date(w.week * 1000).toLocaleDateString()}: ${w.total} commits`}
            className="group relative flex-1 cursor-default"
          >
            <div
              className="w-full rounded-sm bg-primary/40 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function ContributorRow({ c, max }: { c: RepoGitHubAnalytics["contributors"][number]; max: number }) {
  const pct = Math.round((c.totalCommits / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <img
        src={c.avatar}
        alt={c.login}
        className="h-7 w-7 shrink-0 rounded-full border border-border"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-xs font-medium text-foreground">{c.login}</span>
          <span className="shrink-0 text-xs tabular-nums text-foreground-muted">{c.totalCommits} commits</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-0.5 flex gap-2 text-[10px] text-foreground-muted">
          <span className="flex items-center gap-0.5 text-success">
            <Plus className="h-2.5 w-2.5" />{c.additions.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-destructive">
            <Minus className="h-2.5 w-2.5" />{c.deletions.toLocaleString()}
          </span>
          <span>{c.weeksActive}w active</span>
        </div>
      </div>
    </div>
  )
}

export default function GitHubAnalyticsPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<RepoGitHubAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/repos/${repoId}/github-analytics`)
      if (!res.ok) throw new Error()
      const data = await res.json() as { analytics: RepoGitHubAnalytics }
      setAnalytics(data.analytics)
    } catch {
      toast.error("Failed to load GitHub analytics. Check that the repo is connected.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [repoId])

  const totalCommits = analytics?.weeklyCommits.reduce((s, w) => s + w.total, 0) ?? 0
  const maxContrib = Math.max(...(analytics?.contributors.map((c) => c.totalCommits) ?? [1]))
  const maxFile = Math.max(...(analytics?.mostChangedFiles.map((f) => f.changeCount) ?? [1]))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Repository Analytics"
        subtitle="Commit activity, contributor stats, and file change frequency from GitHub"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
            <Button size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {loading && (
        <div className="space-y-8">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      )}

      {!loading && !analytics && (
        <EmptyState
          icon={GitCommit}
          heading="No analytics data"
          description="GitHub stats may still be computing. Try refreshing in a moment."
          action={{ label: "Retry", onClick: load }}
        />
      )}

      {analytics && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <p className="text-xs text-foreground-muted">
            Data from GitHub · fetched {formatRelativeTime(analytics.fetchedAt)}
          </p>

          {/* Commit activity chart */}
          <motion.div variants={fadeInUp}>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Commit Activity</h2>
                  <span className="text-xs text-foreground-muted">Last 26 weeks</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  {totalCommits.toLocaleString()} commits total
                </div>
              </div>
              {analytics.weeklyCommits.length > 0 ? (
                <CommitChart weeks={analytics.weeklyCommits} />
              ) : (
                <div className="flex h-20 items-center justify-center text-xs text-foreground-muted">
                  No commit data — GitHub may still be computing statistics.
                </div>
              )}
              <div className="mt-2 flex justify-between text-[10px] text-foreground-muted">
                <span>26 weeks ago</span>
                <span>Now</span>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contributors */}
            <motion.div variants={fadeInUp}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Top Contributors
              </h2>
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                {analytics.contributors.length > 0 ? (
                  analytics.contributors.map((c) => (
                    <ContributorRow key={c.login} c={c} max={maxContrib} />
                  ))
                ) : (
                  <p className="text-xs text-foreground-muted">No contributor data yet.</p>
                )}
              </div>
            </motion.div>

            {/* File change frequency */}
            <motion.div variants={fadeInUp}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileCode className="h-4 w-4 text-primary" />
                Most Changed Files
                <span className="ml-auto text-xs font-normal text-foreground-muted">changes</span>
              </h2>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                {analytics.mostChangedFiles.length > 0 ? (
                  analytics.mostChangedFiles.map((f) => {
                    const pct = Math.round((f.changeCount / maxFile) * 100)
                    return (
                      <div key={f.path} className="flex items-center gap-3">
                        <span
                          className="w-52 shrink-0 truncate font-mono text-xs text-foreground-muted"
                          title={f.path}
                        >
                          {f.path}
                        </span>
                        <div className="flex-1 overflow-hidden rounded-full bg-background-muted">
                          <div
                            className="h-1.5 rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 shrink-0 text-right text-xs tabular-nums text-foreground-muted">
                          {f.changeCount}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-foreground-muted">No file change data yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
