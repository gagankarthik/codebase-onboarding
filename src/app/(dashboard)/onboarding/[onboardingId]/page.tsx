"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, Code2, Terminal, Calendar, CheckCircle2,
  RefreshCw, Share2, MessageSquare, ExternalLink,
  User, Clock, Sparkles, Zap, GitPullRequest,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StarterTaskCard } from "@/components/guide/starter-task-card"
import { ActivityFeed } from "@/components/guide/activity-feed"
import { ProgressChecklist } from "@/components/guide/progress-checklist"
import { TribalKnowledgePanel } from "@/components/guide/tribal-knowledge-panel"
import { PrPreviewPanel } from "@/components/guide/pr-preview-panel"
import { getInitials, formatRelativeTime, formatDate, daysBetween } from "@/lib/utils"
import type { Onboarding, Guide, OnboardingProgress } from "@/types"

type SectionId = "architecture" | "modules" | "tribal" | "conventions" | "setup" | "firstweek" | "tasks" | "pr"

const NAV: { id: SectionId; icon: typeof Building2; label: string; sub: string }[] = [
  { id: "architecture", icon: Building2,    label: "Architecture",      sub: "High-level overview"        },
  { id: "modules",      icon: Code2,        label: "Key Modules",       sub: "Files you'll touch"         },
  { id: "tribal",       icon: Sparkles,     label: "Convention Copilot",sub: "Unwritten rules"            },
  { id: "conventions",  icon: CheckCircle2, label: "Conventions",       sub: "Coding standards"           },
  { id: "setup",        icon: Terminal,     label: "Setup Steps",       sub: "Get running locally"        },
  { id: "firstweek",   icon: Calendar,     label: "First Week",        sub: "Personalised focus plan"    },
  { id: "tasks",        icon: Zap,          label: "Starter Tasks",     sub: "Good first issues"          },
  { id: "pr",           icon: GitPullRequest, label: "PR Preview",      sub: "Draft your first PR"        },
]

export default function OnboardingDetailPage() {
  const { onboardingId } = useParams<{ onboardingId: string }>()
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [active, setActive] = useState<SectionId>("architecture")

  const load = useCallback(() => {
    fetch(`/api/onboarding/${onboardingId}`)
      .then(r => r.json())
      .then((d: { onboarding: Onboarding; guide: Guide | null }) => {
        setOnboarding(d.onboarding); setGuide(d.guide)
      })
      .catch(() => toast.error("Failed to load onboarding — please refresh."))
      .finally(() => setLoading(false))
  }, [onboardingId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (onboarding?.status !== "generating" && onboarding?.status !== "pending") return
    const t = setInterval(() => {
      fetch(`/api/onboarding/${onboardingId}`).then(r => r.json())
        .then((d: { onboarding: Onboarding; guide: Guide | null }) => {
          setOnboarding(d.onboarding); setGuide(d.guide)
          if (d.onboarding.status === "ready" || d.onboarding.status === "error") clearInterval(t)
        }).catch(() => {})
    }, 5000)
    return () => clearInterval(t)
  }, [onboarding?.status, onboardingId])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/guide/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingId }) })
      const d = await res.json() as { guide?: Guide }
      if (d.guide) { setGuide(d.guide); setOnboarding(p => p ? { ...p, status: "ready" } : p); toast.success("Guide refreshed.") }
    } catch { toast.error("Refresh failed — please try again.") }
    finally { setRefreshing(false) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="md" className="text-primary" /></div>
  if (!onboarding) return <div className="flex h-64 items-center justify-center text-foreground-muted">Onboarding not found</div>

  const isGenerating = onboarding.status === "generating" || onboarding.status === "pending"
  const progress: OnboardingProgress = {
    repoConnected: true,
    guideGenerated: onboarding.status === "ready",
    firstBranchCreated: !!onboarding.firstPrAt,
    firstPrOpened: !!onboarding.firstPrAt,
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={onboarding.newHireName}
        subtitle={`${onboarding.role} · ${onboarding.team}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); toast.success("Link copied.") }}>
              <Share2 className="mr-1.5 h-3.5 w-3.5" />Copy link
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || isGenerating}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Button size="sm" onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />Chat
            </Button>
          </div>
        }
      />

      {/* Hero */}
      <div className="flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card px-6 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {getInitials(onboarding.newHireName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">{onboarding.role}</span>
            <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">{onboarding.team}</span>
            <StatusBadge status={onboarding.status} />
            {guide && <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">v{guide.version}</span>}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            Started {formatDate(onboarding.createdAt)}{guide && ` · Guide updated ${formatRelativeTime(guide.generatedAt)}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center divide-x divide-border">
          {[
            { label: "To first PR", value: onboarding.firstPrAt ? `${daysBetween(onboarding.createdAt, onboarding.firstPrAt)}d` : "—" },
            ...(guide ? [{ label: "Modules", value: String(guide.keyModules.length) }, { label: "Tribal rules", value: String(guide.tribalKnowledge?.length ?? 0) }] : []),
          ].map((s, i) => (
            <div key={i} className="px-5 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <ProgressChecklist progress={progress} />
      {isGenerating && <ActivityFeed startedAt={onboarding.createdAt} role={onboarding.role} />}
      {onboarding.status === "error" && (
        <div className="rounded-xl border border-destructive/20 bg-destructive-subtle p-4 text-sm text-destructive">
          Guide generation failed.{" "}
          <button onClick={handleRefresh} className="font-medium underline underline-offset-2">Try again</button>
        </div>
      )}

      {/* Split panel */}
      {guide ? (
        <div className="flex rounded-xl border border-border overflow-hidden bg-card" style={{ height: "calc(100vh - 340px)", minHeight: 520 }}>

          {/* Left nav */}
          <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-background-subtle">
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Guide Sections</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {NAV.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground-muted hover:bg-background-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : ""}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight ${isActive ? "text-primary-foreground" : "text-foreground"}`}>{item.label}</p>
                      <p className={`text-[11px] leading-tight mt-0.5 truncate ${isActive ? "text-primary-foreground/70" : "text-foreground-muted"}`}>{item.sub}</p>
                    </div>
                  </button>
                )
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}>
                <MessageSquare className="h-3.5 w-3.5" />Ask your codebase
              </Button>
            </div>
          </aside>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-7"
              >
                {/* Content header */}
                {(() => {
                  const meta = NAV.find(n => n.id === active)!
                  const Icon = meta.icon
                  return (
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
                        <Icon className="h-4.5 w-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">{meta.label}</h2>
                        <p className="text-xs text-foreground-muted mt-0.5">{meta.sub}</p>
                      </div>
                    </div>
                  )
                })()}

                <SectionBody section={active} guide={guide} onboardingId={onboardingId} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        !isGenerating && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-foreground-muted">
              No guide yet.{" "}
              <button onClick={handleRefresh} className="font-medium text-primary hover:underline">Generate now</button>
            </p>
          </div>
        )
      )}
    </div>
  )
}

function SectionBody({ section, guide, onboardingId }: { section: SectionId; guide: Guide; onboardingId: string }) {
  switch (section) {
    case "architecture":
      return (
        <div className="rounded-xl border border-border bg-background-subtle p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{guide.architectureOverview}</p>
        </div>
      )

    case "modules":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.keyModules.map((m) => (
            <div key={m.path} className={`rounded-xl border p-4 transition-colors hover:border-primary/40 ${m.relevantForRole ? "border-primary/25 bg-primary-subtle/30" : "border-border bg-background-subtle"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{m.name}</p>
                  <p className="font-mono text-[11px] text-foreground-muted mt-0.5">{m.path}</p>
                </div>
                {m.relevantForRole && <Badge variant="outline" className="shrink-0 text-[10px] border-primary/40 text-primary">Your role</Badge>}
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">{m.purpose}</p>
              {m.whyItMatters && (
                <p className="mt-2.5 text-xs text-foreground leading-relaxed border-t border-border pt-2.5">
                  <Sparkles className="inline h-3 w-3 mr-1 text-amber-500" />{m.whyItMatters}
                </p>
              )}
              {(m.topContributor ?? m.lastUpdated) && (
                <div className="mt-3 flex items-center gap-3 text-xs text-foreground-muted">
                  {m.topContributor && <span className="flex items-center gap-1"><User className="h-3 w-3" />{m.topContributor}</span>}
                  {m.lastUpdated && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.lastUpdated}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )

    case "tribal":
      return guide.tribalKnowledge?.length
        ? <TribalKnowledgePanel insights={guide.tribalKnowledge} />
        : <p className="text-sm text-foreground-muted">No tribal knowledge extracted yet.</p>

    case "conventions":
      return (
        <ol className="space-y-2">
          {guide.codingConventions.map((c, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-background-subtle px-4 py-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
              </div>
              <span className="text-sm text-foreground">{c}</span>
            </li>
          ))}
        </ol>
      )

    case "setup":
      return (
        <ol className="space-y-0">
          {guide.setupSteps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground z-10">{i + 1}</div>
                {i < guide.setupSteps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
              </div>
              <div className={`flex-1 ${i < guide.setupSteps.length - 1 ? "pb-5" : ""}`}>
                <p className="text-sm text-foreground pt-1 leading-relaxed">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      )

    case "firstweek":
      return (
        <div className="rounded-xl border border-accent/30 bg-accent-subtle p-6">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <p className="text-sm leading-relaxed text-foreground">{guide.firstWeekFocus}</p>
          </div>
        </div>
      )

    case "tasks":
      return guide.starterTasks.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {guide.starterTasks.map((task) => <StarterTaskCard key={task.issueNumber} task={task} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background-subtle p-8 text-center">
          <ExternalLink className="mx-auto h-8 w-8 text-foreground-muted mb-3" />
          <p className="text-sm text-foreground-muted">No starter tasks found. Check GitHub for open issues.</p>
        </div>
      )

    case "pr":
      return <PrPreviewPanel onboardingId={onboardingId} />
  }
}
