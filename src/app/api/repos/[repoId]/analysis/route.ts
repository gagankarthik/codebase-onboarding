import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getRepoById } from "@/lib/db/repos"
import { getAnalysisByRepoId, saveAnalysis } from "@/lib/db/analysis"
import { analyzeCodebase } from "@/lib/analysis/codebase"
import { ingestRepo } from "@/lib/github/ingest"

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

  const analysis = await getAnalysisByRepoId(repoId)
  return NextResponse.json({ analysis })
}

export async function POST(
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
    const snapshot = await ingestRepo(session.githubToken, repo.fullName)
    const derived = analyzeCodebase(snapshot)
    const analysis = await saveAnalysis({ repoId, ...derived })
    return NextResponse.json({ analysis })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
