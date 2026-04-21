import { NextRequest, NextResponse } from "next/server"
import { getRepoById } from "@/lib/db/repos"
import { getPageViewsInRange, getSessionsInRange, getActiveSessionCount } from "@/lib/db/analytics"
import { buildSummary, getPeriodRange } from "@/lib/analytics/aggregate"

type Period = "today" | "7d" | "30d"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const repoId = searchParams.get("repoId")
  const period = (searchParams.get("period") ?? "7d") as Period

  if (!repoId) return NextResponse.json({ error: "repoId required" }, { status: 400 })

  const repo = await getRepoById(repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const { from, to } = getPeriodRange(period)
  const fromISO = from.toISOString()
  const toISO = to.toISOString()

  const [views, sessions, activeVisitors] = await Promise.all([
    getPageViewsInRange(repoId, fromISO, toISO),
    getSessionsInRange(repoId, fromISO, toISO),
    getActiveSessionCount(repoId),
  ])

  const summary = buildSummary(views, sessions, activeVisitors, period)
  return NextResponse.json({ summary })
}
