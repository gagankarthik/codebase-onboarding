"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GitBranch, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { RepoCard } from "@/components/dashboard/repo-card"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import type { Repo } from "@/types"

export default function ReposPage() {
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((d) => setRepos(d.repos ?? []))
      .catch(() => toast.error("Failed to load repositories — please refresh."))
      .finally(() => setLoading(false))
  }, [])

  function handleConnect() {
    router.push("/repos/select")
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Repositories"
        subtitle="Connect GitHub repos to generate onboarding guides"
        actions={
          <Button onClick={handleConnect}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Connect repo
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-background-muted" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          heading="No repos connected yet"
          description="Connect your first GitHub repo and have a personalised onboarding guide ready in minutes."
          action={{ label: "Connect repo", onClick: handleConnect }}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {repos.map((repo) => (
            <motion.div key={repo.repoId} variants={fadeInUp}>
              <RepoCard
                repo={repo}
                onNewOnboarding={(id) => router.push(`/repos/${id}`)}
                onClick={(id) => router.push(`/repos/${id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
