"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, Terminal } from "lucide-react"

interface LogEntry {
  id: number
  message: string
  type: "info" | "success" | "progress"
  delay: number
}

function buildLog(role: string): LogEntry[] {
  return [
    { id: 1,  message: "Connecting to GitHub repository...",                         type: "info",     delay: 800  },
    { id: 2,  message: "Authentication verified — reading repository metadata",      type: "success",  delay: 2200 },
    { id: 3,  message: "Fetching full file tree recursively...",                     type: "info",     delay: 4000 },
    { id: 4,  message: "Filtering noise: node_modules, dist, lock files removed",   type: "success",  delay: 6500 },
    { id: 5,  message: "Prioritising entry points and recently modified files...",  type: "progress", delay: 9000 },
    { id: 6,  message: "Reading contents of 60 key source files...",                type: "info",     delay: 12000 },
    { id: 7,  message: "Mapping dependency graph across modules...",                 type: "progress", delay: 16000 },
    { id: 8,  message: "Clustering related files into logical modules...",           type: "progress", delay: 20000 },
    { id: 9,  message: "Extracting coding conventions from 47 recent PR reviews...", type: "progress", delay: 25000 },
    { id: 10, message: "Detecting unwritten rules and tribal knowledge...",          type: "progress", delay: 29000 },
    { id: 11, message: "Interviewing commit history for team patterns...",           type: "info",     delay: 33000 },
    { id: 12, message: "Identifying good-first-issue candidates...",                 type: "progress", delay: 37000 },
    { id: 13, message: `Personalising architecture overview for ${role} role...`,   type: "info",     delay: 42000 },
    { id: 14, message: "Generating setup steps from environment config files...",   type: "progress", delay: 46000 },
    { id: 15, message: "Scoring modules by role relevance...",                       type: "progress", delay: 50000 },
    { id: 16, message: "Writing first-week focus based on sprint objectives...",    type: "progress", delay: 54000 },
    { id: 17, message: "Finalising your personalised onboarding guide...",          type: "info",     delay: 57000 },
  ]
}

interface ActivityFeedProps {
  startedAt: string
  role: string
}

export function ActivityFeed({ startedAt, role }: ActivityFeedProps) {
  const [visibleEntries, setVisibleEntries] = useState<LogEntry[]>([])
  const [progress, setProgress] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const log = buildLog(role)

  useEffect(() => {
    const elapsed = Date.now() - new Date(startedAt).getTime()

    // Show all entries that should already be visible
    const already = log.filter((e) => e.delay <= elapsed)
    setVisibleEntries(already)

    // Schedule remaining entries
    const timers = log
      .filter((e) => e.delay > elapsed)
      .map((entry) =>
        setTimeout(() => {
          setVisibleEntries((prev) => {
            if (prev.find((p) => p.id === entry.id)) return prev
            return [...prev, entry]
          })
        }, entry.delay - elapsed)
      )

    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, role])

  // Animate progress bar 0→95% over 60s
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const duration = 60000
    let raf: number

    function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 95, 95)
      setProgress(pct)
      if (pct < 95) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [startedAt])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [visibleEntries])

  const lastEntry = visibleEntries[visibleEntries.length - 1]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Banner */}
      <div className="flex items-center gap-3 border-b border-border bg-primary-subtle px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            ✨ AI is reading your codebase
          </p>
          <p className="text-xs text-foreground-muted">Guide ready in ~60 seconds</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-background-muted">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Terminal */}
      <div className="bg-[oklch(0.13_0.04_264.4)] dark:bg-[oklch(0.10_0.03_264.4)]">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="h-3 w-3 text-white/40" />
            <span className="text-[11px] text-white/40 font-mono">coa-agent — analysis</span>
          </div>
        </div>

        {/* Log output */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-1.5 font-mono text-xs">
          <AnimatePresence initial={false}>
            {visibleEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2"
              >
                {entry.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-400" />
                ) : entry.type === "progress" ? (
                  <span className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.74_0.175_60)] font-bold leading-none">›</span>
                ) : (
                  <span className="mt-0.5 h-3 w-3 shrink-0 text-white/40 font-bold leading-none">·</span>
                )}
                <span
                  className={
                    entry.type === "success"
                      ? "text-green-400"
                      : entry.type === "progress"
                      ? "text-[oklch(0.74_0.175_60)]"
                      : "text-white/70"
                  }
                >
                  {entry.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Blinking cursor on last active line */}
          {lastEntry && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0" />
              <span className="text-white/40">
                <span className="inline-block h-3 w-2 bg-white/50 animate-pulse" />
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
