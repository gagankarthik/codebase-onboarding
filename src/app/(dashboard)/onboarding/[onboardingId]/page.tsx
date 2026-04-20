"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Building2, Code2, Terminal, Calendar, CheckCircle2,
  RefreshCw, Share2, MessageSquare, ChevronDown,
  ExternalLink, User, Clock, Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StarterTaskCard } from "@/components/guide/starter-task-card"
import { ActivityFeed } from "@/components/guide/activity-feed"
import { ProgressChecklist } from "@/components/guide/progress-checklist"
import { TribalKnowledgePanel } from "@/components/guide/tribal-knowledge-panel"
import { PrPreviewPanel } from "@/components/guide/pr-preview-panel"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { getInitials, formatRelativeTime, formatDate, daysBetween } from "@/lib/utils"
import type { Onboarding, Guide, OnboardingProgress } from "@/types"

function SectionHeader({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-subtle">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
  )
}

function GuideSection({ icon, title, children }: { icon: typeof Building2; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-5 hover:bg-background-subtle transition-colors">
          <SectionHeader icon={icon} title={title} />
          <ChevronDown className={`h-4 w-4 text-foreground-muted transition-transform ${open ? "rotate-180" : ""}`} />
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
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); toast.success("Guide link copied to clipboard.") }}>
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
      </div>

      {/* Progress checklist */}
      <ProgressChecklist progress={progress} />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {isGenerating && <ActivityFeed startedAt={onboarding.createdAt} role={onboarding.role} />}

          {onboarding.status === "error" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive-subtle p-4 text-sm text-destructive">
              Guide generation failed.{" "}
              <button onClick={handleRefresh} className="font-medium underline underline-offset-2">Try again</button>
            </div>
          )}

          {guide ? (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Building2} title="Architecture Overview">
                  <div className="rounded-lg bg-background-subtle p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{guide.architectureOverview}</p>
                  </div>
                </GuideSection>
              </motion.div>

              {/* 5-Module Radar */}
              <motion.div variants={fadeInUp}>
                <GuideSection icon={Code2} title="Modules You'll Touch Most">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {guide.keyModules.map((m) => (
                      <div key={m.path} className={`rounded-xl border p-4 transition-colors hover:border-primary/40 ${m.relevantForRole ? "border-primary/30 bg-primary-subtle/40" : "border-border bg-background-subtle"}`}>
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
                </GuideSection>
              </motion.div>

              {/* Convention Copilot */}
              {guide.tribalKnowledge && guide.tribalKnowledge.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <GuideSection icon={Sparkles} title="Convention Copilot — Tribal Knowledge">
                    <TribalKnowledgePanel insights={guide.tribalKnowledge} />
                  </GuideSection>
                </motion.div>
              )}

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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</div>
                        <span className="text-sm text-foreground pt-0.5">{step}</span>
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

              {/* PR Preview */}
              <motion.div variants={fadeInUp}>
                <PrPreviewPanel onboardingId={onboardingId} />
              </motion.div>
            </motion.div>
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

        {/* Right sidebar */}
        <div className="hidden space-y-4 lg:block">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-subtle">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Ask your codebase</h4>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Role-specific Q&A with source citations that link directly to GitHub.
            </p>
            <Button className="w-full gap-1.5" size="sm" onClick={() => router.push(`/onboarding/${onboardingId}/chat`)}>
              <MessageSquare className="h-3.5 w-3.5" />Open chat
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Quick stats</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Started</span>
                <span className="font-medium text-foreground">{formatDate(onboarding.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">First PR</span>
                <span className="font-medium text-foreground">
                  {onboarding.firstPrAt ? `${daysBetween(onboarding.createdAt, onboarding.firstPrAt)}d` : "Pending"}
                </span>
              </div>
              {guide && <>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Guide version</span>
                  <span className="font-medium text-foreground">v{guide.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Modules mapped</span>
                  <span className="font-medium text-foreground">{guide.keyModules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Tribal rules</span>
                  <span className="font-medium text-foreground">{guide.tribalKnowledge?.length ?? 0}</span>
                </div>
              </>}
            </div>
          </div>

          {guide && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-foreground-muted" />
                <h4 className="text-sm font-semibold text-foreground">Ready to ship?</h4>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Generate a PR draft pre-filled with context from this guide.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
