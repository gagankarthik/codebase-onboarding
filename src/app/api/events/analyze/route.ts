import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getEventById, saveEventAnalysis } from "@/lib/db/events"
import { getRepoById } from "@/lib/db/repos"
import { getOnboardingsByRepoId } from "@/lib/db/onboardings"
import { getGuideByOnboardingId } from "@/lib/db/guides"
import { analyzeEvent } from "@/lib/openai/analyzeEvent"

const BodySchema = z.object({ eventId: z.string() })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "eventId required" }, { status: 400 })

  const event = await getEventById(parsed.data.eventId)
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const repo = await getRepoById(event.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  // Get guide context if available
  let guide = null
  try {
    const onboardings = await getOnboardingsByRepoId(event.repoId)
    const ready = onboardings.find((o) => o.status === "ready")
    if (ready) guide = await getGuideByOnboardingId(ready.onboardingId)
  } catch { /* continue without guide */ }

  const analysis = await analyzeEvent(event, guide, repo.fullName)
  await saveEventAnalysis(event.eventId, analysis)

  return NextResponse.json({ analysis })
}
