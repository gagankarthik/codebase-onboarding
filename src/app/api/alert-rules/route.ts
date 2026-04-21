import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAlertRule, getAlertRulesByRepoId } from "@/lib/db/alert-rules"

const CreateSchema = z.object({
  repoId: z.string().min(1),
  name: z.string().min(1),
  condition: z.enum(["error_count", "critical_error", "high_error_rate", "new_error_type"]),
  threshold: z.number().int().positive().optional(),
  windowMinutes: z.number().int().positive().optional(),
  action: z.enum(["log", "email", "webhook"]),
  actionTarget: z.string().optional(),
  enabled: z.boolean().default(true),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const repoId = request.nextUrl.searchParams.get("repoId")
  if (!repoId) return NextResponse.json({ error: "repoId required" }, { status: 400 })

  const rules = await getAlertRulesByRepoId(repoId)
  return NextResponse.json({ rules })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const rule = await createAlertRule(parsed.data)
  return NextResponse.json({ rule }, { status: 201 })
}
