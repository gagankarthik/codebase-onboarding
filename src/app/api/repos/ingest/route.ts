import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getRepoById, updateRepo } from "@/lib/db/repos"
import { getOnboardingsByRepoId } from "@/lib/db/onboardings"
import { ingestRepo } from "@/lib/github/ingest"

const BodySchema = z.object({ repoId: z.string() })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

  const repo = await getRepoById(parsed.data.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const githubToken = request.headers.get("x-github-token") ?? ""
  const snapshot = await ingestRepo(githubToken, repo.fullName)

  await updateRepo(repo.repoId, {
    lastIngestedAt: new Date().toISOString(),
    description: snapshot.metadata.description || repo.description,
    language: snapshot.metadata.language || repo.language,
    stars: snapshot.metadata.stars,
  })

  const onboardings = await getOnboardingsByRepoId(repo.repoId)
  const activeOnboardings = onboardings.filter((o) => o.status === "ready")
  void activeOnboardings

  return NextResponse.json({ success: true })
}
