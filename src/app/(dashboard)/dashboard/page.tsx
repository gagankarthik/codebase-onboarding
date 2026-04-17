"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GitBranch, Users, Clock, Zap, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import { RepoCard } from "@/components/dashboard/repo-card"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatDate, daysBetween, getInitials } from "@/lib/utils"
import type { Repo, Onboarding } from "@/types"

interface Stats {
  totalRepos: number
  totalOnboardings: number
  avgDaysToFirstPR: number | null
  inProgress: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string | number
  icon: typeof GitBranch
  highlight?: boolean
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-xl border border-border p-6 ${highlight ? "bg-primary-subtle" : "bg-card"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-foreground-muted">{label}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-primary/10" : "bg-background-muted"}`}>
          <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-foreground-muted"}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [onboardings, setOnboardings] = useState<Onboarding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/repos").then((r) => r.json()),
      fetch("/api/onboarding").then((r) => r.json()),
    ])
      .then(([reposData, onboardingsData]) => {
        setRepos(reposData.repos ?? [])
        setOnboardings(onboardingsData.onboardings ?? [])
      })
      .catch(() => toast.error("Failed to load dashboard data — please refresh."))
      .finally(() => setLoading(false))
  }, [])

  const stats: Stats = {
    totalRepos: repos.length,
    totalOnboardings: onboardings.length,
    avgDaysToFirstPR: (() => {
      const withPR = onboardings.filter((o) => o.firstPrAt)
      if (!withPR.length) return null
      const avg = withPR.reduce((sum, o) => sum + daysBetween(o.createdAt, o.firstPrAt!), 0) / withPR.length
      return Math.round(avg * 10) / 10
    })(),
    inProgress: onboardings.filter((o) => o.status === "generating" || o.status === "pending").length,
  }

  const recentOnboardings = [...onboardings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  function getRepoForOnboarding(repoId: string) {
    return repos.find((r) => r.repoId === repoId)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your onboarding activity"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/repos")}>
              <GitBranch className="mr-1.5 h-3.5 w-3.5" />
              Connect repo
            </Button>
            <Button size="sm" disabled={repos.length === 0} onClick={() => router.push("/repos")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New onboarding
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Connected repos" value={stats.totalRepos} icon={GitBranch} highlight />
        <StatCard label="Total onboardings" value={stats.totalOnboardings} icon={Users} />
        <StatCard
          label="Avg. days to first PR"
          value={stats.avgDaysToFirstPR !== null ? `${stats.avgDaysToFirstPR}d` : "—"}
          icon={Clock}
        />
        <StatCard label="In progress" value={stats.inProgress} icon={Zap} />
      </motion.div>

      {/* Recent onboardings */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Recent onboardings</h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-background-muted" />
            ))}
          </div>
        ) : recentOnboardings.length === 0 ? (
          <EmptyState
            icon={Users}
            heading="No onboardings yet"
            description="Connect a repo and create your first onboarding guide to get started."
          />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden md:table-cell">Repo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden lg:table-cell">First PR</th>
                </tr>
              </thead>
              <tbody>
                {recentOnboardings.map((o) => {
                  const repo = getRepoForOnboarding(o.repoId)
                  return (
                    <tr
                      key={o.onboardingId}
                      className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-background-subtle"
                      onClick={() => router.push(`/onboarding/${o.onboardingId}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
                            {getInitials(o.newHireName)}
                          </div>
                          <span className="font-medium text-foreground">{o.newHireName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground-muted hidden sm:table-cell">{o.role}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="font-mono text-xs text-foreground-muted">{repo?.fullName ?? o.repoId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground-muted hidden lg:table-cell">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-xs text-foreground-muted hidden lg:table-cell">
                        {o.firstPrAt ? formatDate(o.firstPrAt) : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Repos */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Your repositories</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-background-muted" />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            heading="No repos connected yet"
            description="Connect your first GitHub repo and have a personalised onboarding guide ready in minutes."
            action={{ label: "Connect repo", onClick: () => router.push("/repos") }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard
                key={repo.repoId}
                repo={repo}
                onNewOnboarding={() => router.push(`/repos/${repo.repoId}`)}
                onClick={(id) => router.push(`/repos/${id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
