import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/auth/session"

export async function POST(_request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" })
  return response
}
