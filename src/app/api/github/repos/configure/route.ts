import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getGitHubClient } from "@/lib/github/client"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await verifySession(sessionToken)
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("fullName")
  if (!fullName) return NextResponse.json({ error: "fullName required" }, { status: 400 })

  const [owner, repo] = fullName.split("/")
  if (!owner || !repo) return NextResponse.json({ error: "Invalid fullName" }, { status: 400 })

  try {
    const octokit = getGitHubClient(session.githubToken)

    const [branchesRes, repoRes] = await Promise.all([
      octokit.repos.listBranches({ owner, repo, per_page: 50 }),
      octokit.repos.get({ owner, repo }),
    ])

    const defaultBranch = repoRes.data.default_branch

    // Get top-level tree of default branch to list sub-folders
    const treeRes = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
    })

    const folders = treeRes.data.tree
      .filter((item) => item.type === "tree")
      .map((item) => item.path ?? "")
      .filter(Boolean)
      .slice(0, 40)

    return NextResponse.json({
      branches: branchesRes.data.map((b) => b.name),
      defaultBranch,
      folders,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch repo configuration" }, { status: 500 })
  }
}
