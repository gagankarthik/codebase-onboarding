import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getRepoById } from "@/lib/db/repos"
import { getRepoGitHubAnalytics } from "@/lib/github/analytics"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
): Promise<NextResponse> {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? "")
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { repoId } = await params
  const repo = await getRepoById(repoId)
  if (!repo || repo.userId !== session.userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const analytics = await getRepoGitHubAnalytics(session.githubToken, repo.fullName)
    return NextResponse.json({ analytics })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
