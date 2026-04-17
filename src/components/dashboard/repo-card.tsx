"use client"

import { Star, GitBranch, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { Repo } from "@/types"

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  JavaScript: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Python: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Go: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Rust: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Ruby: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Java: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "C#": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PHP: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Swift: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Kotlin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "bg-muted text-foreground-muted"
}

interface RepoCardProps {
  repo: Repo
  onNewOnboarding: (repoId: string) => void
  onClick: (repoId: string) => void
}

export function RepoCard({ repo, onNewOnboarding, onClick }: RepoCardProps) {
  const [org, name] = repo.fullName.split("/")

  return (
    <div
      className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
      onClick={() => onClick(repo.repoId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(repo.repoId)}
      aria-label={`Open ${repo.fullName} repository`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <span className="text-xs text-foreground-muted">{org}</span>
          </div>
          <h3 className="mt-0.5 truncate font-semibold text-foreground">{name}</h3>
          {repo.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-foreground-muted">{repo.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {repo.language && (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getLanguageColor(repo.language))}>
            {repo.language}
          </span>
        )}
        {repo.stars !== undefined && (
          <span className="flex items-center gap-1 text-xs text-foreground-muted">
            <Star className="h-3 w-3" />
            {repo.stars.toLocaleString()}
          </span>
        )}
        {repo.lastIngestedAt && (
          <span className="flex items-center gap-1 text-xs text-foreground-muted">
            <RefreshCw className="h-3 w-3" />
            {formatRelativeTime(repo.lastIngestedAt)}
          </span>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onNewOnboarding(repo.repoId)
          }}
        >
          Start onboarding
        </Button>
      </div>
    </div>
  )
}
