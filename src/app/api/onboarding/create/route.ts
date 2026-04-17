import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createOnboarding, updateOnboardingStatus } from "@/lib/db/onboardings"
import { getRepoById } from "@/lib/db/repos"
import { createGuide } from "@/lib/db/guides"
import { generateGuide } from "@/lib/openai/generateGuide"
import { ingestRepo } from "@/lib/github/ingest"
import { getOpenIssues } from "@/lib/github/issues"

const BodySchema = z.object({
  repoId: z.string(),
  newHireName: z.string().min(2),
  newHireEmail: z.string().email(),
  role: z.string().min(2),
  team: z.string().min(1),
  firstSprintFocus: z.string().min(10),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
  }

  const repo = await getRepoById(parsed.data.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const onboarding = await createOnboarding({
    ...parsed.data,
    status: "pending",
  })

  await updateOnboardingStatus(onboarding.onboardingId, "generating")

  const githubToken = request.headers.get("x-github-token") ?? ""

  ;(async () => {
    try {
      const [snapshot, issues] = await Promise.all([
        ingestRepo(githubToken, repo.fullName),
        getOpenIssues(githubToken, repo.fullName),
      ])

      const guideData = await generateGuide({
        repoSnapshot: snapshot,
        onboarding: { ...onboarding, status: "generating" },
        openIssues: issues,
      })

      await createGuide({ ...guideData, onboardingId: onboarding.onboardingId })
      await updateOnboardingStatus(onboarding.onboardingId, "ready")
    } catch {
      await updateOnboardingStatus(onboarding.onboardingId, "error")
    }
  })()

  return NextResponse.json({ onboarding }, { status: 201 })
}
