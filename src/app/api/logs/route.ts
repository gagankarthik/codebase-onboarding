import { NextRequest, NextResponse } from "next/server"
import { getApiLogsByUser } from "@/lib/db/api-logs"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? "100"),
    500
  )

  const logs = await getApiLogsByUser(userId, limit)
  return NextResponse.json({ logs, total: logs.length })
}
