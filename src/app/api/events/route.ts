import { NextRequest, NextResponse } from "next/server"
import { getRepoById, getReposByUserId } from "@/lib/db/repos"
import { getEventsByRepoId, getEventStats } from "@/lib/db/events"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const repoId = searchParams.get("repoId")
  const since = searchParams.get("since") ?? undefined
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200)
  const statsOnly = searchParams.get("stats") === "1"

  if (repoId) {
    const repo = await getRepoById(repoId)
    if (!repo || repo.userId !== userId) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 })
    }

    if (statsOnly) {
      const stats = await getEventStats(repoId, 24)
      return NextResponse.json({ stats })
    }

    const events = await getEventsByRepoId(repoId, limit, since)
    return NextResponse.json({ events })
  }

  // Return summary for all repos
  const repos = await getReposByUserId(userId)
  const summaries = await Promise.all(
    repos.map(async (repo) => {
      const stats = await getEventStats(repo.repoId, 24)
      return { repo, stats }
    })
  )
  return NextResponse.json({ summaries })
}
