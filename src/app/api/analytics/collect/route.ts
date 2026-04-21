import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getRepoById } from "@/lib/db/repos"
import { recordPageView, updatePageViewDuration, upsertSession } from "@/lib/db/analytics"
import { parseUA } from "@/lib/analytics/aggregate"

const CollectSchema = z.object({
  repoId: z.string(),
  sessionId: z.string().max(128),
  event: z.enum(["pageview", "leave"]),
  pathname: z.string().max(500),
  referrer: z.string().max(500).optional(),
  duration: z.number().int().min(0).max(86400).optional(),
  pvId: z.string().optional(), // passed back on "leave" to update duration
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => ({}))
  const parsed = CollectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { repoId, sessionId, event, pathname, referrer, duration, pvId } = parsed.data

  const repo = await getRepoById(repoId).catch(() => null)
  if (!repo) return NextResponse.json({ ok: false }, { status: 404 })

  if (event === "leave" && pvId && duration != null) {
    await updatePageViewDuration(pvId, duration).catch(() => {})
    return NextResponse.json({ ok: true })
  }

  const ua = request.headers.get("user-agent") ?? ""
  const { device, browser, os } = parseUA(ua)

  const [pv] = await Promise.all([
    recordPageView({ repoId, sessionId, pathname, referrer, device, browser, os }),
    upsertSession(sessionId, repoId),
  ])

  return NextResponse.json({ ok: true, pvId: pv.pvId })
}
