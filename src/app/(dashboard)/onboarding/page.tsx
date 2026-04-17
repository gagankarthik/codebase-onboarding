"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatDate, getInitials } from "@/lib/utils"
import type { Onboarding } from "@/types"

export default function OnboardingsPage() {
  const router = useRouter()
  const [onboardings, setOnboardings] = useState<Onboarding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((d: { onboardings: Onboarding[] }) => setOnboardings(d.onboardings ?? []))
      .catch(() => toast.error("Failed to load onboardings — please refresh."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader title="Onboardings" subtitle="All engineer onboarding sessions across your repos" />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-background-muted" />
          ))}
        </div>
      ) : onboardings.length === 0 ? (
        <EmptyState
          icon={Users}
          heading="No onboardings yet"
          description="Connect a repo and generate your first personalised onboarding guide."
          action={{ label: "Go to repos", onClick: () => router.push("/repos") }}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden md:table-cell">Team</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {onboardings.map((o) => (
                <motion.tr
                  key={o.onboardingId}
                  variants={fadeInUp}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-background-subtle transition-colors"
                  onClick={() => router.push(`/onboarding/${o.onboardingId}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
                        {getInitials(o.newHireName)}
                      </div>
                      <span className="font-medium text-foreground">{o.newHireName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted hidden sm:table-cell">{o.role}</td>
                  <td className="px-4 py-3 text-foreground-muted hidden md:table-cell">{o.team}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground-muted hidden lg:table-cell">
                    {formatDate(o.createdAt)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
