import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { getRepoById } from "@/lib/db/repos"
import { getOnboardingsByRepoId, updateOnboardingStatus } from "@/lib/db/onboardings"
import { getGuideByOnboardingId, updateGuide } from "@/lib/db/guides"
import { ingestRepo } from "@/lib/github/ingest"
import { getOpenIssues } from "@/lib/github/issues"
import { generateGuide } from "@/lib/openai/generateGuide"

async function verifySignature(request: NextRequest, body: string): Promise<boolean> {
  const signature = request.headers.get("x-hub-signature-256")
  if (!signature) return false

  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? ""
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex")
  return signature === expected
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const isValid = await verifySignature(request, body)
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })

  const event = request.headers.get("x-github-event")
  if (event !== "push") return NextResponse.json({ received: true })

  const payload = JSON.parse(body) as { repository?: { id?: number } }
  const githubRepoId = payload.repository?.id
  if (!githubRepoId) return NextResponse.json({ received: true })

  ;(async () => {
    try {
      const { data: repos } = await import("@aws-sdk/lib-dynamodb").then(() =>
        ({ data: [] as Awaited<ReturnType<typeof getOnboardingsByRepoId>> })
      )
      void repos
    } catch {}
  })()

  return NextResponse.json({ received: true })
}
