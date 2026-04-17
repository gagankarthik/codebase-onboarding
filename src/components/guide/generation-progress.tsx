"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface GenerationProgressProps {
  startedAt: string
}

export function GenerationProgress({ startedAt }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const duration = 60000

    let rafId: number
    function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 95, 95)
      setProgress(pct)
      if (pct < 95) {
        rafId = requestAnimationFrame(tick)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [startedAt])

  return (
    <div className="rounded-xl border border-primary/20 bg-primary-subtle px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            AI is reading your codebase — guide ready in ~60 seconds
          </p>
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
          <p className="mt-1.5 text-xs text-foreground-muted">
            Analysing architecture, conventions, and starter tasks...
          </p>
        </div>
      </div>
    </div>
  )
}
