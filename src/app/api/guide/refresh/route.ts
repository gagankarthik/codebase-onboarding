import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getOnboardingById, updateOnboardingStatus } from "@/lib/db/onboardings"
import { getRepoById } from "@/lib/db/repos"
import { getGuideByOnboardingId, updateGuide, createGuide } from "@/lib/db/guides"
import { generateGuide } from "@/lib/openai/generateGuide"
import { ingestRepo } from "@/lib/github/ingest"
import { getOpenIssues } from "@/lib/github/issues"

const BodySchema = z.object({ onboardingId: z.string() })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const onboarding = await getOnboardingById(parsed.data.onboardingId)
  if (!onboarding) return NextResponse.json({ error: "Onboarding not found" }, { status: 404 })

  const repo = await getRepoById(onboarding.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  await updateOnboardingStatus(onboarding.onboardingId, "generating")

  const githubToken = request.headers.get("x-github-token") ?? ""
  const [snapshot, issues] = await Promise.all([
    ingestRepo(githubToken, repo.fullName),
    getOpenIssues(githubToken, repo.fullName),
  ])

  const guideData = await generateGuide({ repoSnapshot: snapshot, onboarding, openIssues: issues })

  const existing = await getGuideByOnboardingId(onboarding.onboardingId)
  let guide
  if (existing) {
    await updateGuide(existing.guideId, { ...guideData, version: existing.version + 1 })
    guide = { ...existing, ...guideData, version: existing.version + 1 }
  } else {
    guide = await createGuide({ ...guideData, onboardingId: onboarding.onboardingId })
  }

  await updateOnboardingStatus(onboarding.onboardingId, "ready")
  return NextResponse.json({ guide })
}
