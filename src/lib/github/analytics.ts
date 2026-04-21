import type { WeeklyCommit, ContributorStat, FileChangeFrequency, RepoGitHubAnalytics } from "@/types"
import { getGitHubClient } from "./client"

export async function getRepoGitHubAnalytics(
  accessToken: string,
  fullName: string
): Promise<RepoGitHubAnalytics> {
  const octokit = getGitHubClient(accessToken)
  const [owner, repo] = fullName.split("/")

  // GitHub stats endpoints can return 202 on first call (still computing).
  // We retry once after a short delay.
  async function fetchWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let result = await fn()
    if (result === null || (Array.isArray(result) && result.length === 0)) {
      await new Promise((r) => setTimeout(r, 2000))
      result = await fn()
    }
    return result
  }

  const [commitActivityRaw, contributorsRaw] = await Promise.allSettled([
    fetchWithRetry(() =>
      octokit.repos
        .getCommitActivityStats({ owner, repo })
        .then((r) => r.data)
        .catch(() => [])
    ),
    fetchWithRetry(() =>
      octokit.repos
        .getContributorsStats({ owner, repo })
        .then((r) => r.data)
        .catch(() => [])
    ),
  ])

  // ── Weekly commits ─────────────────────────────────────────────────────────
  const rawCommitActivity =
    commitActivityRaw.status === "fulfilled" ? (commitActivityRaw.value ?? []) : []

  const weeklyCommits: WeeklyCommit[] = (rawCommitActivity as Array<{
    week: number
    total: number
    days: number[]
  }>)
    .slice(-26) // last 26 weeks
    .map((w) => ({
      week: w.week,
      total: w.total,
      additions: 0,
      deletions: 0,
    }))

  // ── Contributors ───────────────────────────────────────────────────────────
  const rawContributors =
    contributorsRaw.status === "fulfilled" ? (contributorsRaw.value ?? []) : []

  const contributors: ContributorStat[] = (
    rawContributors as Array<{
      author: { login: string; avatar_url: string } | null
      total: number
      weeks: Array<{ a: number; d: number; c: number }>
    }>
  )
    .filter((c) => c.author)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((c) => ({
      login: c.author!.login,
      avatar: c.author!.avatar_url,
      totalCommits: c.total,
      additions: c.weeks.reduce((s, w) => s + (w.a ?? 0), 0),
      deletions: c.weeks.reduce((s, w) => s + (w.d ?? 0), 0),
      weeksActive: c.weeks.filter((w) => w.c > 0).length,
    }))

  // ── File change frequency (from recent commits) ────────────────────────────
  let mostChangedFiles: FileChangeFrequency[] = []
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 30,
    })

    const fileCounts: Record<string, { count: number; lastChanged: string }> = {}
    await Promise.allSettled(
      commits.slice(0, 15).map(async (commit) => {
        try {
          const { data: detail } = await octokit.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          })
          for (const file of detail.files ?? []) {
            if (!file.filename) continue
            if (!fileCounts[file.filename]) {
              fileCounts[file.filename] = { count: 0, lastChanged: commit.commit.author?.date ?? "" }
            }
            fileCounts[file.filename].count++
          }
        } catch {
          // skip individual commit failures
        }
      })
    )

    mostChangedFiles = Object.entries(fileCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 15)
      .map(([path, info]) => ({ path, changeCount: info.count, lastChanged: info.lastChanged }))
  } catch {
    mostChangedFiles = []
  }

  return {
    fullName,
    weeklyCommits,
    contributors,
    mostChangedFiles,
    fetchedAt: new Date().toISOString(),
  }
}
