import type { GitHubIssue } from "@/types"
import { getGitHubClient } from "./client"

export async function getOpenIssues(
  accessToken: string,
  fullName: string
): Promise<GitHubIssue[]> {
  const octokit = getGitHubClient(accessToken)
  const [owner, repo] = fullName.split("/")

  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "open",
    labels: "good first issue",
    per_page: 30,
  })

  const goodFirstIssues: GitHubIssue[] = data.map((issue) => ({
    number: issue.number,
    title: issue.title,
    body: issue.body ?? undefined,
    labels: (issue.labels as { name: string }[]).map((l) => ({ name: l.name })),
    html_url: issue.html_url,
  }))

  if (goodFirstIssues.length < 10) {
    const { data: helpWanted } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      labels: "help wanted",
      per_page: 30 - goodFirstIssues.length,
    })
    const existing = new Set(goodFirstIssues.map((i) => i.number))
    for (const issue of helpWanted) {
      if (!existing.has(issue.number)) {
        goodFirstIssues.push({
          number: issue.number,
          title: issue.title,
          body: issue.body ?? undefined,
          labels: (issue.labels as { name: string }[]).map((l) => ({ name: l.name })),
          html_url: issue.html_url,
        })
      }
    }
  }

  return goodFirstIssues.slice(0, 30)
}
