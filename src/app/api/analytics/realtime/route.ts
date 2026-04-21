import { NextRequest } from "next/server"
import { getRepoById } from "@/lib/db/repos"
import { getActiveSessionCount } from "@/lib/db/analytics"

export async function GET(request: NextRequest): Promise<Response> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return new Response("Unauthorized", { status: 401 })

  const repoId = new URL(request.url).searchParams.get("repoId")
  if (!repoId) return new Response("repoId required", { status: 400 })

  const repo = await getRepoById(repoId)
  if (!repo || repo.userId !== userId) return new Response("Not found", { status: 404 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      async function push() {
        if (closed) return
        try {
          const count = await getActiveSessionCount(repoId!)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ active: count })}\n\n`))
        } catch {
          closed = true
          controller.close()
        }
      }

      await push()
      const interval = setInterval(push, 5000)

      request.signal.addEventListener("abort", () => {
        closed = true
        clearInterval(interval)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
