import { NextRequest, NextResponse } from "next/server"
import { getOrCreateApiKey } from "@/lib/db/users"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getOrCreateApiKey(userId)
  return NextResponse.json({ apiKey })
}
