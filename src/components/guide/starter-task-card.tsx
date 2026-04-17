import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, getDifficultyColor } from "@/lib/utils"
import type { StarterTask } from "@/types"

interface StarterTaskCardProps {
  task: StarterTask
}

export function StarterTaskCard({ task }: StarterTaskCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-foreground-muted">#{task.issueNumber}</span>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", getDifficultyColor(task.difficulty))}>
          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
        </span>
      </div>
      <h4 className="font-semibold text-sm text-foreground leading-snug">{task.title}</h4>
      <p className="text-xs text-foreground-muted leading-relaxed">{task.why}</p>
      <Button size="sm" variant="outline" className="mt-auto w-full gap-1.5" asChild>
        <a href={task.url} target="_blank" rel="noopener noreferrer">
          Open on GitHub
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}
