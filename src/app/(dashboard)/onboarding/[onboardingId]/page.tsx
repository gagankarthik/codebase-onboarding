"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, Code2, Terminal, Calendar, CheckCircle2,
  RefreshCw, Share2, MessageSquare, ExternalLink,
  User, Clock, Sparkles, Zap, GitPullRequest,
  ChevronRight,
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
import { fadeInUp } from "@/lib/animations"
import { getInitials, formatRelativeTime, formatDate, daysBetween } from "@/lib/utils"
import type { Onboarding, Guide, OnboardingProgress } from "@/types"

type SectionId =
  | "architecture"
  | "modules"
  | "tribal"
  | "conventions"
  | "setup"
  | "firstweek"
  | "tasks"
  | "pr"

interface NavItem {
  id: SectionId
  label: string
  icon: typeof Building2
  requiresGuide: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "architecture", label: "Architecture Overview", icon: Building2, requiresGuide: true },
  { id: "modules", label: "Key Modules", icon: Code2, requiresGuide: true },
  { id: "tribal", label: "Convention Copilot", icon: Sparkles, requiresGuide: true },
  { id: "conventions", label: "Coding Conventions", icon: CheckCircle2, requiresGuide: true },
  { id: "setup", label: "Setup Steps", icon: Terminal, requiresGuide: true },
  { id: "firstweek", label: "Your First Week", icon: Calendar, requiresGuide: true },
  { id: "tasks", label: "Starter Tasks", icon: Zap, requiresGuide: true },
  { id: "pr", label: "PR Preview", icon: GitPullRequest, requiresGuide: false },
]

export default function OnboardingDetailPage() {
  const { onboardingId } = useParams<{ onboardingId: string }>()
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>("architecture")

  const load = useCallback(() => {
    fetch(`/api/onboarding/${onboardingId}`)
      .then((r) => r.json())
      .then((d: { onboarding: Onboarding; guide: Guide | null }) => {
        setOnboarding(d.onboarding)
        setGuide(d.guide)
      })
      .catch(() => toast.error("Failed to load onboarding — please refresh."))
      .finally(() => setLoading(false))
  }, [onboardingId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (onboarding?.status !== "generating" && onboarding?.status !== "pending") return
    const interval = setInterval(() => {
      fetch(`/api/onboarding/${onboardingId}`)
        .then((r) => r.json())
        .then((d: { onboarding: Onboarding; guide: Guide | null }) => {
          setOnboarding(d.onboarding)
          setGuide(d.guide)
          if (d.onboarding.status === "ready" || d.onboarding.status === "error") clearInterval(interval)
        })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [onboarding?.status, onboardingId])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/guide/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingId }),
      })
      const d = await res.json() as { guide?: Guide }
      if (d.guide) {
        setGuide(d.guide)
        setOnboarding((prev) => prev ? { ...prev, status: "ready" } : prev)
        toast.success("Guide refreshed successfully.")
      }
    } catch {
      toast.error("Failed to refresh guide — please try again.")
    } finally {
      setRefreshing(false)
    }
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
    <div className="space-y-6">
      <PageHeader
        title={onboarding.newHireName}
        subtitle={`${onboarding.role} · ${onboarding.team}`}
        actions={
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); toast.success("Guide link copied.") }}>
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

      {/* Hero card */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
          {getInitials(onboarding.newHireName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">{onboarding.role}</span>
            <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">{onboarding.team}</span>
            <StatusBadge status={onboarding.status} />
            {guide && <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">v{guide.version}</span>}
          </div>
          <p className="mt-1.5 text-xs text-foreground-muted">
            Started {formatDate(onboarding.createdAt)}{guide && ` · Guide updated ${formatRelativeTime(guide.generatedAt)}`}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {onboarding.firstPrAt ? `${daysBetween(onboarding.createdAt, onboarding.firstPrAt)}d` : "—"}
            </p>
            <p className="text-xs text-foreground-muted">To first PR</p>
          </div>
          {guide && (
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{guide.keyModules.length}</p>
              <p className="text-xs text-foreground-muted">Modules</p>
            </div>
          )}
          {guide && (
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{guide.tribalKnowledge?.length ?? 0}</p>
              <p className="text-xs text-foreground-muted">Tribal rules</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress checklist */}
      <ProgressChecklist progress={progress} />

      {/* Generating state */}
      {isGenerating && <ActivityFeed startedAt={onboarding.createdAt} role={onboarding.role} />}

      {onboarding.status === "error" && (
        <div className="rounded-xl border border-destructive/20 bg-destructive-subtle p-4 text-sm text-destructive">
          Guide generation failed.{" "}
          <button onClick={handleRefresh} className="font-medium underline underline-offset-2">Try again</button>
        </div>
      )}

      {/* Two-panel layout */}
      {guide ? (
        <div className="flex gap-0 rounded-xl border border-border bg-card overflow-hidden min-h-[600px]">
          {/* Left nav sidebar */}
          <nav className="w-56 shrink-0 border-r border-border bg-background-subtle flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide px-2">Guide Sections</p>
            </div>
            <div className="flex-1 py-2 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 mx-1.5 rounded-lg text-left transition-all text-sm ${
                      isActive
                        ? "bg-primary-subtle text-primary font-medium border-l-2 border-primary pl-[10px]"
                        : "text-foreground-muted hover:bg-background-muted hover:text-foreground"
                    }`}
                    style={{ width: "calc(100% - 12px)" }}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-foreground-muted"}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
                  </button>
                )
              })}
            </div>
            <div className="p-3 border-t border-border">
              <Button
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}
              >
                <MessageSquare className="h-3.5 w-3.5" />Ask your codebase
              </Button>
            </div>
          </nav>

          {/* Right content panel */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-6 h-full"
              >
                <SectionContent
                  section={activeSection}
                  guide={guide}
                  onboardingId={onboardingId}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        !isGenerating && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-foreground-muted">
              No guide generated yet.{" "}
              <button onClick={handleRefresh} className="font-medium text-primary hover:underline">Generate now</button>
            </p>
          </div>
        )
      )}
    </div>
  )
}

function SectionContent({ section, guide, onboardingId }: { section: SectionId; guide: Guide; onboardingId: string }) {
  switch (section) {
    case "architecture":
      return (
        <SectionShell icon={Building2} title="Architecture Overview" description="High-level structure and design of this codebase.">
          <div className="rounded-xl border border-border bg-background-subtle p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{guide.architectureOverview}</p>
          </div>
        </SectionShell>
      )

    case "modules":
      return (
        <SectionShell icon={Code2} title="Key Modules" description="The files and directories you'll be working with most.">
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.keyModules.map((m) => (
              <div
                key={m.path}
                className={`rounded-xl border p-4 transition-colors hover:border-primary/40 ${
                  m.relevantForRole ? "border-primary/30 bg-primary-subtle/40" : "border-border bg-background-subtle"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{m.name}</p>
                    <p className="font-mono text-xs text-foreground-muted mt-0.5">{m.path}</p>
                  </div>
                  {m.relevantForRole && (
                    <Badge variant="outline" className="shrink-0 text-[10px] border-primary/40 text-primary">Your role</Badge>
                  )}
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">{m.purpose}</p>
                {m.whyItMatters && (
                  <p className="mt-2 text-xs text-foreground leading-relaxed border-t border-border pt-2">
                    <Sparkles className="inline h-3 w-3 mr-1 text-accent-foreground" />
                    {m.whyItMatters}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-foreground-muted">
                  {m.topContributor && <span className="flex items-center gap-1"><User className="h-3 w-3" />{m.topContributor}</span>}
                  {m.lastUpdated && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.lastUpdated}</span>}
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      )

    case "tribal":
      return (
        <SectionShell icon={Sparkles} title="Convention Copilot" description="Unwritten rules and tribal knowledge extracted from the codebase.">
          {guide.tribalKnowledge && guide.tribalKnowledge.length > 0 ? (
            <TribalKnowledgePanel insights={guide.tribalKnowledge} />
          ) : (
            <p className="text-sm text-foreground-muted">No tribal knowledge extracted yet.</p>
          )}
        </SectionShell>
      )

    case "conventions":
      return (
        <SectionShell icon={CheckCircle2} title="Coding Conventions" description="Standards and patterns followed across this codebase.">
          <ol className="space-y-3">
            {guide.codingConventions.map((c, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-background-subtle px-4 py-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                </div>
                <span className="text-sm text-foreground">{c}</span>
              </li>
            ))}
          </ol>
        </SectionShell>
      )

    case "setup":
      return (
        <SectionShell icon={Terminal} title="Setup Steps" description="Get your local environment running from scratch.">
          <ol className="space-y-0">
            {guide.setupSteps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground z-10">
                    {i + 1}
                  </div>
                  {i < guide.setupSteps.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1 mb-1" />
                  )}
                </div>
                <div className={`flex-1 ${i < guide.setupSteps.length - 1 ? "pb-5" : ""}`}>
                  <p className="text-sm text-foreground pt-1 leading-relaxed">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionShell>
      )

    case "firstweek":
      return (
        <SectionShell icon={Calendar} title="Your First Week" description="A personalised focus plan for your first 5 days.">
          <div className="rounded-xl border border-accent/30 bg-accent-subtle p-5">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
              <p className="text-sm leading-relaxed text-foreground">{guide.firstWeekFocus}</p>
            </div>
          </div>
        </SectionShell>
      )

    case "tasks":
      return (
        <SectionShell icon={Zap} title="Starter Tasks" description="Good first issues to help you make your first real contribution.">
          {guide.starterTasks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {guide.starterTasks.map((task) => (
                <StarterTaskCard key={task.issueNumber} task={task} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-background-subtle p-8 text-center">
              <ExternalLink className="mx-auto h-8 w-8 text-foreground-muted mb-3" />
              <p className="text-sm text-foreground-muted">No starter tasks found. Check GitHub issues for open work.</p>
            </div>
          )}
        </SectionShell>
      )

    case "pr":
      return (
        <SectionShell icon={GitPullRequest} title="PR Preview" description="Generate a professional pull request draft from your work description.">
          <PrPreviewPanel onboardingId={onboardingId} />
        </SectionShell>
      )
  }
}

function SectionShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
          <Icon className="h-4.5 w-4.5 text-primary" style={{ height: "1.125rem", width: "1.125rem" }} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-foreground-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}
