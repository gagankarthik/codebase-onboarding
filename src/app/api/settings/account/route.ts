import { NextRequest, NextResponse } from "next/server"
import { getUserById, updateUserProfile } from "@/lib/db/users"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await getUserById(userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({
    user: { userId: user.userId, name: user.name, email: user.email, plan: user.plan },
  })
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  await updateUserProfile(userId, { name })
  return NextResponse.json({ success: true })
}
