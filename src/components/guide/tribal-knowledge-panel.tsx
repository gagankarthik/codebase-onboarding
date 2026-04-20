"use client"

import { motion } from "framer-motion"
import { Brain, Code2, Shield, TestTube2, Layers, Wrench, Sparkles } from "lucide-react"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import type { ConventionInsight } from "@/types"

const CATEGORY_CONFIG: Record<
  ConventionInsight["category"],
  { icon: typeof Code2; label: string; color: string; bg: string; border: string }
> = {
  naming:           { icon: Code2,      label: "Naming",         color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/40",   border: "border-blue-200 dark:border-blue-900" },
  "error-handling": { icon: Shield,     label: "Error Handling", color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/40",     border: "border-red-200 dark:border-red-900" },
  testing:          { icon: TestTube2,  label: "Testing",        color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40", border: "border-green-200 dark:border-green-900" },
  patterns:         { icon: Layers,     label: "Patterns",       color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-900" },
  architecture:     { icon: Brain,      label: "Architecture",   color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-900" },
  tooling:          { icon: Wrench,     label: "Tooling",        color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-900" },
}

interface TribalKnowledgePanelProps {
  insights: ConventionInsight[]
}

export function TribalKnowledgePanel({ insights }: TribalKnowledgePanelProps) {
  if (!insights.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-subtle">
          <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tribal Knowledge Unlocked</h3>
          <p className="text-xs text-foreground-muted">Unwritten rules detected from code patterns and PR history</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-2.5 sm:grid-cols-2"
      >
        {insights.map((insight, i) => {
          const cfg = CATEGORY_CONFIG[insight.category] ?? CATEGORY_CONFIG.patterns
          const Icon = cfg.icon
          return (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`rounded-xl border p-3.5 ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white dark:bg-white/10`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground font-medium">{insight.rule}</p>
                  <p className={`mt-1 text-xs ${cfg.color} font-medium`}>{insight.confidence}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
