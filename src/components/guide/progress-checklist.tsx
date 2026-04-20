"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingProgress } from "@/types"

const STEPS: { key: keyof OnboardingProgress; label: string; description: string }[] = [
  { key: "repoConnected",     label: "Repo connected",      description: "GitHub repository linked" },
  { key: "guideGenerated",    label: "Guide generated",     description: "AI analysis complete" },
  { key: "firstBranchCreated", label: "First branch",       description: "Local environment ready" },
  { key: "firstPrOpened",     label: "First PR opened",     description: "First real contribution" },
]

interface ProgressChecklistProps {
  progress: OnboardingProgress
}

export function ProgressChecklist({ progress }: ProgressChecklistProps) {
  const completedCount = Object.values(progress).filter(Boolean).length
  const pct = Math.round((completedCount / STEPS.length) * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Onboarding progress</h3>
          <p className="text-xs text-foreground-muted mt-0.5">{completedCount} of {STEPS.length} milestones reached</p>
        </div>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: pct === 100 ? "oklch(0.595 0.145 163)" : "oklch(0.546 0.243 264.4)" }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 rounded-full bg-background-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct === 100 ? "oklch(0.595 0.145 163)" : "oklch(0.546 0.243 264.4)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, i) => {
          const done = progress[step.key]
          const isNext = !done && STEPS.slice(0, i).every((s) => progress[s.key])

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
              {/* Connector line left */}
              <div className="flex w-full items-center">
                <div className={cn("h-px flex-1", i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : isNext
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-foreground-muted"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isNext ? (
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className={cn("h-px flex-1", i === STEPS.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={cn("text-[11px] font-semibold leading-tight", done ? "text-primary" : isNext ? "text-foreground" : "text-foreground-muted")}>
                  {step.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-foreground-muted hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
