import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getRepoById, getReposByUserId } from "@/lib/db/repos"
import { saveSecurityScan, getLatestScanByRepoId } from "@/lib/db/security"
import { ingestRepo } from "@/lib/github/ingest"
import { scanFiles, buildScan } from "@/lib/security/scanner"
import type { DependencyVulnerabilities } from "@/types"

const ScanBodySchema = z.object({ repoId: z.string() })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = ScanBodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "repoId is required" }, { status: 400 })

  const repo = await getRepoById(parsed.data.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const githubToken = request.headers.get("x-github-token") ?? ""

  let snapshot
  try {
    snapshot = await ingestRepo(githubToken, repo.fullName)
  } catch {
    return NextResponse.json({ error: "Failed to fetch repo contents from GitHub" }, { status: 502 })
  }

  const { findings } = scanFiles(snapshot.files)

  const emptyDeps: DependencyVulnerabilities = { critical: 0, high: 0, moderate: 0, low: 0, total: 0 }
  const scan = buildScan(repo.repoId, findings, emptyDeps)

  await saveSecurityScan(scan)

  return NextResponse.json({ scan })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const repoId = searchParams.get("repoId")

  if (repoId) {
    const repo = await getRepoById(repoId)
    if (!repo || repo.userId !== userId) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 })
    }
    const scan = await getLatestScanByRepoId(repoId)
    return NextResponse.json({ scan })
  }

  const repos = await getReposByUserId(userId)
  const scans = await Promise.all(
    repos.map(async (repo) => {
      const scan = await getLatestScanByRepoId(repo.repoId)
      return { repo, scan }
    })
  )

  return NextResponse.json({ scans })
}
