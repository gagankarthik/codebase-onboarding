import { cn } from "@/lib/utils"

type Status = "pending" | "generating" | "ready" | "error"

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning-subtle text-warning-foreground border-warning/20",
  },
  generating: {
    label: "Generating...",
    className: "bg-primary-subtle text-primary border-primary/20",
  },
  ready: {
    label: "Ready",
    className: "bg-success-subtle text-success border-success/20",
  },
  error: {
    label: "Error",
    className: "bg-destructive-subtle text-destructive border-destructive/20",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {status === "generating" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      )}
      {status === "ready" && (
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
      )}
      {config.label}
    </span>
  )
}
