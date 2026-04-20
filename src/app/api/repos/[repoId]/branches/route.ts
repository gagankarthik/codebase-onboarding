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

  try {
    const octokit = getGitHubClient(session.githubToken)
    const [owner, repoName] = repo.fullName.split("/")

    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo: repoName,
      per_page: 50,
    })

    const branchDetails = await Promise.all(
      branches.map(async (b) => {
        const { data: commit } = await octokit.repos.getCommit({
          owner,
          repo: repoName,
          ref: b.commit.sha,
        })
        return {
          name: b.name,
          protected: b.protected,
          sha: b.commit.sha,
          message: commit.commit.message.split("\n")[0],
          author: commit.commit.author?.name ?? "Unknown",
          date: commit.commit.author?.date ?? "",
        }
      })
    )

    return NextResponse.json({ branches: branchDetails })
  } catch {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}
