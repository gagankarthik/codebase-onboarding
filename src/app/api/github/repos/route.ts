import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getGitHubClient } from "@/lib/github/client"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await verifySession(sessionToken)
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const octokit = getGitHubClient(session.githubToken)
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      type: "all",
    })

    const result = repos.map((r) => ({
      id: r.id,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      stargazers_count: r.stargazers_count,
      private: r.private,
      updated_at: r.updated_at,
    }))

    return NextResponse.json({ repos: result })
  } catch {
    return NextResponse.json({ error: "Failed to fetch GitHub repositories" }, { status: 500 })
  }
}
