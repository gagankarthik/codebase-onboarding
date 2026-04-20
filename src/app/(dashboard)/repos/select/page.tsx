"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  GitBranch,
  Star,
  Lock,
  Search,
  CheckCircle2,
  ChevronDown,
  Folder,
  Settings2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageHeader } from "@/components/ui/page-header"
import { staggerContainer, fadeInUp, scaleIn } from "@/lib/animations"

interface GitHubRepo {
  id: number
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  private: boolean
  updated_at: string
}

interface RepoConfig {
  branches: string[]
  defaultBranch: string
  folders: string[]
}

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

function ConfigPanel({
  repo,
  config,
  onConnect,
  onClose,
  connecting,
}: {
  repo: GitHubRepo
  config: RepoConfig | null
  onConnect: (branch: string, subfolder: string) => void
  onClose: () => void
  connecting: boolean
}) {
  const [branch, setBranch] = useState(config?.defaultBranch ?? "main")
  const [subfolder, setSubfolder] = useState("")
  const [branchOpen, setBranchOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)

  useEffect(() => {
    if (config?.defaultBranch) setBranch(config.defaultBranch)
  }, [config])

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="mt-3 rounded-xl border border-primary/30 bg-primary-subtle p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Scope Configuration</span>
        </div>
        <button onClick={onClose} className="text-foreground-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-foreground-muted">
        Select a branch and optionally a sub-folder (for monorepos). This reduces noise and speeds up AI analysis.
      </p>

      {config === null ? (
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <LoadingSpinner size="sm" />
          Loading branches and folders...
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Branch selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted">Branch</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setBranchOpen((v) => !v); setFolderOpen(false) }}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/50 focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-foreground-muted" />
                  <span className="font-mono">{branch}</span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted transition-transform ${branchOpen ? "rotate-180" : ""}`} />
              </button>
              {branchOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                  {config.branches.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => { setBranch(b); setBranchOpen(false) }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-background-muted ${b === branch ? "text-primary font-medium" : "text-foreground"}`}
                    >
                      <GitBranch className="h-3 w-3 shrink-0 text-foreground-muted" />
                      <span className="font-mono truncate">{b}</span>
                      {b === config.defaultBranch && (
                        <span className="ml-auto text-xs text-foreground-muted">default</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subfolder selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted">
              Sub-folder <span className="text-foreground-subtle">(optional, for monorepos)</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setFolderOpen((v) => !v); setBranchOpen(false) }}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/50 focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <Folder className="h-3.5 w-3.5 text-foreground-muted" />
                  <span className={subfolder ? "font-mono" : "text-foreground-muted"}>
                    {subfolder || "Entire repository"}
                  </span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted transition-transform ${folderOpen ? "rotate-180" : ""}`} />
              </button>
              {folderOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setSubfolder(""); setFolderOpen(false) }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-background-muted ${!subfolder ? "text-primary font-medium" : "text-foreground-muted"}`}
                  >
                    Entire repository
                  </button>
                  {config.folders.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => { setSubfolder(f); setFolderOpen(false) }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-background-muted ${f === subfolder ? "text-primary font-medium" : "text-foreground"}`}
                    >
                      <Folder className="h-3 w-3 shrink-0 text-foreground-muted" />
                      <span className="font-mono truncate">{f}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-foreground-muted">
          Scanning: <span className="font-mono text-foreground">{repo.full_name}/{subfolder || "**"}</span> on <span className="font-mono text-foreground">{branch}</span>
        </p>
        <Button
          size="sm"
          onClick={() => onConnect(branch, subfolder)}
          disabled={connecting || config === null}
          className="gap-1.5"
        >
          {connecting ? (
            <>
              <LoadingSpinner size="sm" />
              Connecting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connect repo
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default function RepoSelectPage() {
  const router = useRouter()
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [connectedIds, setConnectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [repoConfig, setRepoConfig] = useState<RepoConfig | null>(null)
  const [connecting, setConnecting] = useState(false)

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

  async function handleSelectRepo(repo: GitHubRepo) {
    if (connectedIds.has(repo.id)) return
    setSelectedRepo(repo)
    setRepoConfig(null)
    try {
      const res = await fetch(`/api/github/repos/configure?fullName=${encodeURIComponent(repo.full_name)}`)
      const data = await res.json() as RepoConfig
      setRepoConfig(data)
    } catch {
      toast.error("Failed to load repo configuration.")
    }
  }

  async function handleConnect(branch: string, subfolder: string) {
    if (!selectedRepo) return
    setConnecting(true)
    try {
      const res = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: selectedRepo.full_name, branch, subfolder: subfolder || undefined }),
      })
      const data = await res.json() as { repo?: { repoId: string }; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to connect")
      setConnectedIds((prev) => new Set([...prev, selectedRepo.id]))
      toast.success(`${selectedRepo.full_name} connected — AI is ingesting the codebase.`)
      if (data.repo?.repoId) router.push(`/repos/${data.repo.repoId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect repository")
    } finally {
      setConnecting(false)
    }
  }

  const filtered = githubRepos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Select a repository"
        subtitle="Connect a GitHub repo — pick the branch and sub-folder for precise AI analysis"
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
            const isSelected = selectedRepo?.id === repo.id
            return (
              <motion.div key={repo.id} variants={fadeInUp}>
                <div
                  className={`rounded-xl border transition-all ${isSelected ? "border-primary/40 shadow-sm" : "border-border"} bg-card`}
                >
                  <div className="flex items-center justify-between gap-4 p-4">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => !isConnected && (isSelected ? setSelectedRepo(null) : handleSelectRepo(repo))}
                      disabled={isConnected}
                    >
                      <div className="flex items-center gap-2">
                        {repo.private ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                        ) : (
                          <GitBranch className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                        )}
                        <span className="truncate font-medium text-foreground">{repo.full_name}</span>
                        {repo.private && (
                          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-foreground-muted">
                            Private
                          </span>
                        )}
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
                    </button>

                    {isConnected ? (
                      <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        Connected
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => isSelected ? setSelectedRepo(null) : handleSelectRepo(repo)}
                        className="shrink-0 gap-1.5"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        {isSelected ? "Cancel" : "Configure"}
                      </Button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <div className="px-4 pb-4">
                        <ConfigPanel
                          repo={repo}
                          config={repoConfig}
                          onConnect={handleConnect}
                          onClose={() => setSelectedRepo(null)}
                          connecting={connecting}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
