import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getOnboardingById } from "@/lib/db/onboardings"
import { getRepoById } from "@/lib/db/repos"
import { createMessage, getMessagesByOnboardingId } from "@/lib/db/messages"
import { streamChat } from "@/lib/openai/chat"
import { ingestRepo } from "@/lib/github/ingest"

const BodySchema = z.object({
  onboardingId: z.string(),
  message: z.string().min(1).max(2000),
})

export async function POST(request: NextRequest): Promise<Response> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const onboarding = await getOnboardingById(parsed.data.onboardingId)
  if (!onboarding) return NextResponse.json({ error: "Onboarding not found" }, { status: 404 })

  const repo = await getRepoById(onboarding.repoId)
  if (!repo || repo.userId !== userId) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 })
  }

  const [history] = await Promise.all([
    getMessagesByOnboardingId(parsed.data.onboardingId),
  ])

  await createMessage({
    onboardingId: parsed.data.onboardingId,
    role: "user",
    content: parsed.data.message,
  })

  const githubToken = request.headers.get("x-github-token") ?? ""
  const snapshot = await ingestRepo(githubToken, repo.fullName)

  const aiStream = await streamChat({
    question: parsed.data.message,
    repoSnapshot: snapshot,
    conversationHistory: history.slice(-10),
  })

  let fullResponse = ""
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk)
      const match = text.match(/data: ({.*})\n/)
      if (match) {
        try {
          const parsed = JSON.parse(match[1]) as { text?: string }
          if (parsed.text) fullResponse += parsed.text
        } catch {}
      }
      controller.enqueue(chunk)
    },
    flush() {
      createMessage({
        onboardingId: parsed.data.onboardingId,
        role: "assistant",
        content: fullResponse,
      }).catch(() => {})
    },
  })

  return new Response(aiStream.pipeThrough(transformStream), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
