import { NextRequest, NextResponse } from "next/server"
import { regenerateApiKey } from "@/lib/db/users"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await regenerateApiKey(userId)
  return NextResponse.json({ apiKey })
}
