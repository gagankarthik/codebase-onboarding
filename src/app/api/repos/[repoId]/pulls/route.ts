import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getRepoById } from "@/lib/db/repos"
import { getGitHubClient } from "@/lib/github/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await verifySession(sessionToken)
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { repoId } = await params
  const repo = await getRepoById(repoId)
  if (!repo || repo.userId !== session.userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const state = (searchParams.get("state") ?? "open") as "open" | "closed" | "all"

  try {
    const octokit = getGitHubClient(session.githubToken)
    const [owner, repoName] = repo.fullName.split("/")

    const { data: pulls } = await octokit.pulls.list({
      owner,
      repo: repoName,
      state,
      per_page: 50,
      sort: "updated",
    })

    const result = pulls.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      draft: pr.draft ?? false,
      user: pr.user?.login ?? "Unknown",
      userAvatar: pr.user?.avatar_url ?? "",
      base: pr.base.ref,
      head: pr.head.ref,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      url: pr.html_url,
      labels: pr.labels.map((l) => ({ name: l.name ?? "", color: l.color ?? "" })),
      reviewCount: pr.requested_reviewers?.length ?? 0,
      commentCount: 0,
    }))

    return NextResponse.json({ pulls: result })
  } catch {
    return NextResponse.json({ error: "Failed to fetch pull requests" }, { status: 500 })
  }
}
