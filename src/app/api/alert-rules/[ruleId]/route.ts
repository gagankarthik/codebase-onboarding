import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAlertRuleById, updateAlertRule, deleteAlertRule } from "@/lib/db/alert-rules"

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  threshold: z.number().int().positive().optional(),
  windowMinutes: z.number().int().positive().optional(),
  action: z.enum(["log", "email", "webhook"]).optional(),
  actionTarget: z.string().optional(),
  enabled: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ruleId } = await params
  const rule = await getAlertRuleById(ruleId)
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  await updateAlertRule(ruleId, parsed.data)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ruleId } = await params
  await deleteAlertRule(ruleId)
  return NextResponse.json({ success: true })
}
