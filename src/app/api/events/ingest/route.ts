import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createEvent } from "@/lib/db/events"
import { getRepoById } from "@/lib/db/repos"
import { saveEventAnalysis } from "@/lib/db/events"
import { analyzeEvent } from "@/lib/openai/analyzeEvent"
import { getGuideByOnboardingId } from "@/lib/db/guides"
import { getOnboardingsByRepoId } from "@/lib/db/onboardings"

const EventSchema = z.object({
  repoId: z.string(),
  type: z.enum(["error", "warning", "api_error", "page_view", "performance", "info"]),
  message: z.string().max(2000),
  stack: z.string().max(5000).optional(),
  url: z.string().max(500).optional(),
  filename: z.string().max(500).optional(),
  lineno: z.number().int().optional(),
  colno: z.number().int().optional(),
  userAgent: z.string().max(300).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Public endpoint — authenticated via API key header
  const apiKey = request.headers.get("x-api-key") ?? request.headers.get("authorization")?.replace("Bearer ", "")
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = EventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const repo = await getRepoById(parsed.data.repoId)
  if (!repo) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const event = await createEvent(parsed.data)

  // Auto-analyze errors in the background — don't await
  if (event.type === "error" || event.type === "api_error") {
    autoAnalyze(event.eventId, repo.repoId, repo.fullName).catch(() => {})
  }

  return NextResponse.json({ eventId: event.eventId }, { status: 201 })
}

async function autoAnalyze(eventId: string, repoId: string, repoFullName: string) {
  const { getEventById } = await import("@/lib/db/events")
  const event = await getEventById(eventId)
  if (!event) return

  // Try to get guide context from the latest onboarding
  let guide = null
  try {
    const onboardings = await getOnboardingsByRepoId(repoId)
    const ready = onboardings.find((o) => o.status === "ready")
    if (ready) guide = await getGuideByOnboardingId(ready.onboardingId)
  } catch { /* no guide context — still analyze */ }

  const analysis = await analyzeEvent(event, guide, repoFullName)
  await saveEventAnalysis(eventId, analysis)
}
