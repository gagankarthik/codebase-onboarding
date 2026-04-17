import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getOnboardingById, updateOnboardingStatus, markFirstPR } from "@/lib/db/onboardings"
import { getGuideByOnboardingId } from "@/lib/db/guides"
import { getMessagesByOnboardingId } from "@/lib/db/messages"

const PutSchema = z.object({
  status: z.enum(["pending", "generating", "ready", "error"]).optional(),
  markFirstPR: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const onboarding = await getOnboardingById(id)
  if (!onboarding) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [guide, messages] = await Promise.all([
    getGuideByOnboardingId(id),
    getMessagesByOnboardingId(id),
  ])

  return NextResponse.json({ onboarding, guide, messageCount: messages.length })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = PutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  if (parsed.data.status) {
    await updateOnboardingStatus(id, parsed.data.status)
  }
  if (parsed.data.markFirstPR) {
    await markFirstPR(id)
  }

  const onboarding = await getOnboardingById(id)
  return NextResponse.json({ onboarding })
}
