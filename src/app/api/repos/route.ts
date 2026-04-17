import { NextRequest, NextResponse } from "next/server"
import { getReposByUserId } from "@/lib/db/repos"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const repos = await getReposByUserId(userId)
  return NextResponse.json({ repos })
}
