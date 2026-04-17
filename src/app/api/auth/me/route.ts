import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ user: null })

  const session = await verifySession(token)
  if (!session) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      userId: session.userId,
      name: session.name,
      email: session.email,
      avatar: session.avatar,
    },
  })
}
