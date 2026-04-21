import { NextRequest, NextResponse } from "next/server"
import { logApiCall } from "@/lib/db/api-logs"

// Internal endpoint called fire-and-forget from the proxy middleware.
// The "x-internal: 1" header is a soft guard — this endpoint is not exposed publicly.
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (request.headers.get("x-internal") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json() as {
      userId?: string
      method?: string
      path?: string
      userAgent?: string
      timestamp?: string
    }
    await logApiCall({
      userId: body.userId,
      method: body.method ?? "UNKNOWN",
      path: body.path ?? "/",
      userAgent: body.userAgent,
    })
  } catch {
    // Silently swallow — logging must never fail a request
  }

  return NextResponse.json({ ok: true })
}
