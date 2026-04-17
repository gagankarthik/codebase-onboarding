import { NextRequest, NextResponse } from "next/server"
import { getMessagesByOnboardingId } from "@/lib/db/messages"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const onboardingId = searchParams.get("onboardingId")
  if (!onboardingId) return NextResponse.json({ error: "Missing onboardingId" }, { status: 400 })

  const messages = await getMessagesByOnboardingId(onboardingId)
  return NextResponse.json({ messages })
}
