"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Building2,
  Code2,
  Terminal,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Share2,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ModuleCard } from "@/components/guide/module-card"
import { StarterTaskCard } from "@/components/guide/starter-task-card"
import { GenerationProgress } from "@/components/guide/generation-progress"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { getInitials, formatRelativeTime, formatDate } from "@/lib/utils"
import type { Onboarding, Guide } from "@/types"

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Building2
  title: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-subtle">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
  )
}

function GuideSection({
  icon,
  title,
  children,
}: {
  icon: typeof Building2
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-5 hover:bg-background-subtle transition-colors">
          <SectionHeader icon={icon} title={title} />
          <ChevronDown
            className={`h-4 w-4 text-foreground-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-5">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default function OnboardingDetailPage() {
  const { onboardingId } = useParams<{ onboardingId: string }>()
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  useEffect(() => {
    load()
  }, [load])

  // Poll while generating
  useEffect(() => {
    if (onboarding?.status !== "generating" && onboarding?.status !== "pending") return
    const interval = setInterval(() => {
      fetch(`/api/onboarding/${onboardingId}`)
        .then((r) => r.json())
        .then((d: { onboarding: Onboarding; guide: Guide | null }) => {
          setOnboarding(d.onboarding)
          setGuide(d.guide)
          if (d.onboarding.status === "ready" || d.onboarding.status === "error") {
            clearInterval(interval)
          }
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

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    toast.success("Guide link copied to clipboard.")
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    )
  }

  if (!onboarding) {
    return (
      <div className="flex h-64 items-center justify-center text-foreground-muted">
        Onboarding not found
      </div>
    )
  }

  const isGenerating = onboarding.status === "generating" || onboarding.status === "pending"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {getInitials(onboarding.newHireName)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {onboarding.newHireName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">
                {onboarding.role}
              </span>
              <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
                {onboarding.team}
              </span>
              <StatusBadge status={onboarding.status} />
              {guide && (
                <span className="rounded-full bg-background-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
                  v{guide.version}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Copy link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isGenerating}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh guide
          </Button>
          <Button size="sm" onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            Chat
          </Button>
        </div>
      </div>

      {guide && (
        <p className="text-xs text-foreground-muted">
          Last updated {formatRelativeTime(guide.generatedAt)}
        </p>
      )}

      {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main guide content */}
        <div className="space-y-4">
          {isGenerating && (
            <GenerationProgress startedAt={onboarding.createdAt} />
          )}

          {onboarding.status === "error" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive-subtle p-4 text-sm text-destructive">
              Guide generation failed. Please click &quot;Refresh guide&quot; to try again.
            </div>
          )}

          {guide ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {/* Architecture */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Building2} title="Architecture Overview">
                  <div className="rounded-lg bg-background-subtle p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {guide.architectureOverview}
                    </p>
                  </div>
                </GuideSection>
              </motion.div>

              {/* Key Modules */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Code2} title="Key Modules">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {guide.keyModules.map((m) => (
                      <ModuleCard key={m.path} module={m} />
                    ))}
                  </div>
                </GuideSection>
              </motion.div>

              {/* Coding Conventions */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={CheckCircle2} title="Coding Conventions">
                  <ol className="space-y-3">
                    {guide.codingConventions.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-sm text-foreground">{c}</span>
                      </li>
                    ))}
                  </ol>
                </GuideSection>
              </motion.div>

              {/* Setup Steps */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Terminal} title="Setup Steps">
                  <ol className="space-y-4">
                    {guide.setupSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        {i < guide.setupSteps.length - 1 && (
                          <div className="absolute ml-3 mt-6 h-full w-px bg-border" />
                        )}
                        <span className="text-sm text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </GuideSection>
              </motion.div>

              {/* First Week */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Calendar} title="Your First Week">
                  <div className="rounded-lg border border-accent/20 bg-accent-subtle p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                      <p className="text-sm leading-relaxed text-foreground">{guide.firstWeekFocus}</p>
                    </div>
                  </div>
                </GuideSection>
              </motion.div>

              {/* Starter Tasks */}
              {guide.starterTasks.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <GuideSection icon={CheckCircle2} title="Starter Tasks">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {guide.starterTasks.map((task) => (
                        <StarterTaskCard key={task.issueNumber} task={task} />
                      ))}
                    </div>
                  </GuideSection>
                </motion.div>
              )}
            </motion.div>
          ) : (
            !isGenerating && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-sm text-foreground-muted">
                  No guide generated yet.{" "}
                  <button onClick={handleRefresh} className="font-medium text-primary hover:underline">
                    Generate now
                  </button>
                </p>
              </div>
            )
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden space-y-4 lg:block">
          {/* Chat preview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold text-foreground">Ask about this codebase</h4>
            <p className="mt-1 text-xs text-foreground-muted">
              Get instant answers about the architecture, patterns, and conventions
            </p>
            <Button
              className="mt-3 w-full gap-1.5"
              size="sm"
              onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Open chat
            </Button>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Quick stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Started</span>
                <span className="font-medium text-foreground">{formatDate(onboarding.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">First PR</span>
                <span className="font-medium text-foreground">
                  {onboarding.firstPrAt ? formatDate(onboarding.firstPrAt) : "Pending"}
                </span>
              </div>
              {guide && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Guide version</span>
                  <span className="font-medium text-foreground">v{guide.version}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
