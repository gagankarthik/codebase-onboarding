"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GitBranch, Star, Lock, Search, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageHeader } from "@/components/ui/page-header"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import type { Metadata } from "next"

interface GitHubRepo {
  id: number
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  private: boolean
  updated_at: string
}

// Language colour map
const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Ruby: "bg-red-500",
  Java: "bg-amber-700",
  "C#": "bg-purple-500",
  "C++": "bg-pink-500",
  PHP: "bg-indigo-400",
}

function langColor(lang: string | null) {
  if (!lang) return "bg-foreground-subtle"
  return LANG_COLORS[lang] ?? "bg-foreground-subtle"
}

export default function RepoSelectPage() {
  const router = useRouter()
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [connectedIds, setConnectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [connecting, setConnecting] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [ghRes, connRes] = await Promise.all([
          fetch("/api/github/repos"),
          fetch("/api/repos"),
        ])
        const ghData = await ghRes.json() as { repos?: GitHubRepo[] }
        const connData = await connRes.json() as { repos?: { githubRepoId: number }[] }
        setGithubRepos(ghData.repos ?? [])
        setConnectedIds(new Set((connData.repos ?? []).map((r) => r.githubRepoId)))
      } catch {
        toast.error("Failed to load repositories — please refresh.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = githubRepos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function connect(repo: GitHubRepo) {
    setConnecting(repo.id)
    try {
      const res = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: repo.full_name }),
      })
      const data = await res.json() as { repo?: { repoId: string }; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to connect")
      setConnectedIds((prev) => new Set([...prev, repo.id]))
      toast.success(`${repo.full_name} connected — ingesting codebase now.`)
      if (data.repo?.repoId) {
        router.push(`/repos/${data.repo.repoId}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect repository")
    } finally {
      setConnecting(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Select a repository"
        subtitle="Choose which GitHub repo to connect for onboarding guide generation"
        actions={
          <Button variant="outline" onClick={() => router.push("/repos")}>
            Cancel
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          placeholder="Search repositories..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="md" className="text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card text-sm text-foreground-muted">
          No repositories found
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {filtered.map((repo) => {
            const isConnected = connectedIds.has(repo.id)
            const isConnecting = connecting === repo.id
            return (
              <motion.div
                key={repo.id}
                variants={fadeInUp}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {repo.private ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                    ) : (
                      <GitBranch className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                    )}
                    <span className="truncate font-medium text-foreground">{repo.full_name}</span>
                  </div>
                  {repo.description && (
                    <p className="mt-1 truncate text-xs text-foreground-muted">{repo.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${langColor(repo.language)}`} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => connect(repo)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1.5" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
