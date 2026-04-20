"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GitBranch,
  RefreshCw,
  Plus,
  Star,
  ExternalLink,
  GitPullRequest,
  GitMerge,
  Lock,
  Circle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { formatDate, formatRelativeTime, getInitials, daysBetween } from "@/lib/utils"
import type { Repo, Onboarding } from "@/types"

const ROLE_SUGGESTIONS = [
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Engineer",
  "Platform Engineer",
  "Security Engineer",
]

const IntakeSchema = z.object({
  newHireName: z.string().min(2, "Name must be at least 2 characters"),
  newHireEmail: z.string().email("Enter a valid email address"),
  role: z.string().min(2, "Role is required"),
  team: z.string().min(1, "Team is required"),
  firstSprintFocus: z.string().min(10, "Describe their first sprint focus (at least 10 chars)"),
})
type IntakeData = z.infer<typeof IntakeSchema>

interface Branch {
  name: string
  protected: boolean
  sha: string
  message: string
  author: string
  date: string
}

interface PullRequest {
  number: number
  title: string
  state: string
  draft: boolean
  user: string
  userAvatar: string
  base: string
  head: string
  createdAt: string
  updatedAt: string
  mergedAt: string | null
  url: string
  labels: { name: string; color: string }[]
  reviewCount: number
  commentCount: number
}

function IntakeForm({
  repoId,
  onSuccess,
}: {
  repoId: string
  onSuccess: (o: Onboarding) => void
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [roleInput, setRoleInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IntakeData>({ resolver: zodResolver(IntakeSchema) })

  async function onSubmit(data: IntakeData) {
    const res = await fetch("/api/onboarding/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, repoId }),
    })
    const json = await res.json() as { onboarding?: Onboarding; error?: string }
    if (!res.ok) throw new Error(json.error ?? "Failed to create onboarding")
    toast.success(`Onboarding started for ${data.newHireName} — guide generating now.`)
    onSuccess(json.onboarding!)
  }

  async function handleFormSubmit(data: IntakeData) {
    try {
      await onSubmit(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create onboarding")
    }
  }

  const filteredSuggestions = ROLE_SUGGESTIONS.filter((r) =>
    r.toLowerCase().includes(roleInput.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 px-1">
      <div className="space-y-1.5">
        <Label htmlFor="newHireName">Full name</Label>
        <Input id="newHireName" placeholder="Alex Johnson" aria-invalid={!!errors.newHireName} {...register("newHireName")} />
        {errors.newHireName && <p className="text-xs text-destructive">{errors.newHireName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newHireEmail">Work email</Label>
        <Input id="newHireEmail" type="email" placeholder="alex@company.com" aria-invalid={!!errors.newHireEmail} {...register("newHireEmail")} />
        {errors.newHireEmail && <p className="text-xs text-destructive">{errors.newHireEmail.message}</p>}
      </div>

      <div className="relative space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          placeholder="Backend Engineer"
          autoComplete="off"
          aria-invalid={!!errors.role}
          {...register("role", {
            onChange: (e) => {
              setRoleInput(e.target.value)
              setShowSuggestions(true)
            },
          })}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full rounded-lg border border-border bg-card shadow-md">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-background-muted"
                onMouseDown={() => {
                  setValue("role", s)
                  setRoleInput(s)
                  setShowSuggestions(false)
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="team">Team</Label>
        <Input id="team" placeholder="Platform" aria-invalid={!!errors.team} {...register("team")} />
        {errors.team && <p className="text-xs text-destructive">{errors.team.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="firstSprintFocus">First sprint focus</Label>
        <Textarea
          id="firstSprintFocus"
          placeholder="What will they be working on in their first sprint?"
          className="min-h-24 resize-none"
          aria-invalid={!!errors.firstSprintFocus}
          {...register("firstSprintFocus")}
        />
        {errors.firstSprintFocus && <p className="text-xs text-destructive">{errors.firstSprintFocus.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Generating guide...
          </>
        ) : (
          "Generate onboarding guide"
        )}
      </Button>
    </form>
  )
}

function BranchesTab({ repoId }: { repoId: string }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/repos/${repoId}/branches`)
      .then((r) => r.json())
      .then((d) => setBranches(d.branches ?? []))
      .catch(() => toast.error("Failed to load branches."))
      .finally(() => setLoading(false))
  }, [repoId])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    )
  }

  if (branches.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-foreground-muted">
        No branches found
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {branches.map((branch, i) => (
        <motion.div
          key={branch.name}
          variants={fadeInUp}
          className={`flex items-start justify-between gap-4 px-4 py-3 ${i < branches.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
              <span className="font-mono text-sm font-medium text-foreground">{branch.name}</span>
              {branch.protected && (
                <span className="flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 text-xs text-warning-foreground">
                  <Lock className="h-3 w-3" />
                  Protected
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-foreground-muted">{branch.message}</p>
          </div>
          <div className="shrink-0 text-right text-xs text-foreground-muted">
            <p>{branch.author}</p>
            <p>{branch.date ? formatRelativeTime(branch.date) : ""}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function PullRequestsTab({ repoId, repoFullName }: { repoId: string; repoFullName: string }) {
  const [pulls, setPulls] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"open" | "closed">("open")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/repos/${repoId}/pulls?state=${filter}`)
      .then((r) => r.json())
      .then((d) => setPulls(d.pulls ?? []))
      .catch(() => toast.error("Failed to load pull requests."))
      .finally(() => setLoading(false))
  }, [repoId, filter])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === "open" ? "default" : "outline"}
          onClick={() => setFilter("open")}
        >
          <Circle className="mr-1.5 h-3 w-3" />
          Open
        </Button>
        <Button
          size="sm"
          variant={filter === "closed" ? "default" : "outline"}
          onClick={() => setFilter("closed")}
        >
          <CheckCircle2 className="mr-1.5 h-3 w-3" />
          Closed
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <LoadingSpinner size="md" className="text-primary" />
        </div>
      ) : pulls.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-sm text-foreground-muted">
          No {filter} pull requests
        </div>
      ) : (
        <motion.div
          key={filter}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {pulls.map((pr, i) => (
            <motion.div
              key={pr.number}
              variants={fadeInUp}
              className={`flex items-start gap-3 px-4 py-3 ${i < pulls.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="mt-0.5 shrink-0">
                {pr.mergedAt ? (
                  <GitMerge className="h-4 w-4 text-[hsl(var(--primary))]" />
                ) : pr.state === "open" ? (
                  <GitPullRequest className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {pr.title}
                  </a>
                  {pr.draft && (
                    <span className="rounded-full bg-background-muted px-2 py-0.5 text-xs text-foreground-muted">
                      Draft
                    </span>
                  )}
                  {pr.labels.map((label) => (
                    <span
                      key={label.name}
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `#${label.color}22`, color: `#${label.color}` }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  #{pr.number} ·{" "}
                  <span className="font-mono">{pr.head}</span>
                  {" → "}
                  <span className="font-mono">{pr.base}</span>
                  {" · "}
                  {pr.mergedAt
                    ? `merged ${formatRelativeTime(pr.mergedAt)}`
                    : `${pr.state === "open" ? "opened" : "closed"} ${formatRelativeTime(pr.updatedAt)}`}{" "}
                  by {pr.user}
                </p>
              </div>

              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-foreground-muted hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function RepoDetailPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const router = useRouter()
  const [repo, setRepo] = useState<Repo | null>(null)
  const [onboardings, setOnboardings] = useState<Onboarding[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/repos`).then((r) => r.json()),
      fetch(`/api/onboarding`).then((r) => r.json()),
    ])
      .then(([reposData, onboardingsData]) => {
        const found = (reposData.repos as Repo[]).find((r) => r.repoId === repoId)
        setRepo(found ?? null)
        const repoOnboardings = (onboardingsData.onboardings as Onboarding[]).filter(
          (o) => o.repoId === repoId
        )
        setOnboardings(repoOnboardings)
      })
      .catch(() => toast.error("Failed to load repository — please refresh."))
      .finally(() => setLoading(false))
  }, [repoId])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      })
      if (!res.ok) throw new Error("Sync failed")
      toast.success("Repository synced — any active guides will refresh shortly.")
    } catch {
      toast.error("Sync failed — check your GitHub connection and try again.")
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="flex h-64 items-center justify-center text-foreground-muted">
        Repository not found
      </div>
    )
  }

  const [org, name] = repo.fullName.split("/")

  return (
    <div className="space-y-8">
      <PageHeader
        title={name}
        subtitle={`${org} · ${repo.language ?? "Unknown language"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Sync now
            </Button>
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New onboarding
            </Button>
          </div>
        }
      />

      {/* Repo meta */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 text-sm">
        {repo.description && <p className="flex-1 text-foreground-muted">{repo.description}</p>}
        {repo.stars !== undefined && (
          <span className="flex items-center gap-1 text-foreground-muted">
            <Star className="h-3.5 w-3.5" />
            {repo.stars.toLocaleString()} stars
          </span>
        )}
        {repo.lastIngestedAt && (
          <span className="flex items-center gap-1 text-foreground-muted">
            <RefreshCw className="h-3.5 w-3.5" />
            Last synced {formatRelativeTime(repo.lastIngestedAt)}
          </span>
        )}
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <a
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="onboardings">
        <TabsList>
          <TabsTrigger value="onboardings">Onboardings</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="pulls">Pull Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="onboardings" className="mt-6">
          {onboardings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-foreground-muted">
                No onboardings yet —{" "}
                <button
                  onClick={() => setSheetOpen(true)}
                  className="font-medium text-primary hover:underline"
                >
                  create the first one
                </button>
              </p>
            </div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted hidden md:table-cell">Days to first PR</th>
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
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-foreground-muted hidden md:table-cell">
                        {o.firstPrAt ? `${daysBetween(o.createdAt, o.firstPrAt)}d` : "—"}
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
        </TabsContent>

        <TabsContent value="branches" className="mt-6">
          <BranchesTab repoId={repoId} />
        </TabsContent>

        <TabsContent value="pulls" className="mt-6">
          <PullRequestsTab repoId={repoId} repoFullName={repo.fullName} />
        </TabsContent>
      </Tabs>

      {/* Intake sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>Start onboarding</SheetTitle>
            <p className="text-sm text-foreground-muted">
              Fill in the new hire&apos;s details to generate a personalised guide for{" "}
              <span className="font-medium text-foreground">{repo.fullName}</span>
            </p>
          </SheetHeader>
          <IntakeForm
            repoId={repoId}
            onSuccess={(o) => {
              setOnboardings((prev) => [o, ...prev])
              setSheetOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
