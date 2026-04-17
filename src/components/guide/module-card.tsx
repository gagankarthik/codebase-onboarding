import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { GuideModule } from "@/types"

interface ModuleCardProps {
  module: GuideModule
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-mono text-sm font-semibold text-foreground">{module.name}</h4>
        {module.relevantForRole && (
          <Badge variant="secondary" className="shrink-0 bg-primary-subtle text-primary text-xs">
            Relevant for your role
          </Badge>
        )}
      </div>
      <p className="mt-0.5 font-mono text-xs text-foreground-muted">{module.path}</p>
      <p className="mt-2 text-sm text-foreground-muted">{module.purpose}</p>
    </div>
  )
}
