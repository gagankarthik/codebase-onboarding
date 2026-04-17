import type { ChatMessage, RepoSnapshot } from "@/types"
import { getOpenAIClient } from "./client"

function retrieveRelevantFiles(
  question: string,
  snapshot: RepoSnapshot
): { path: string; content: string }[] {
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  const scored = snapshot.files.map((file) => {
    const combined = (file.path + " " + file.content).toLowerCase()
    const score = words.reduce((acc, word) => acc + (combined.includes(word) ? 1 : 0), 0)
    return { file, score }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.file)
}

export async function streamChat(params: {
  question: string
  repoSnapshot: RepoSnapshot
  conversationHistory: ChatMessage[]
}): Promise<ReadableStream> {
  const { question, repoSnapshot, conversationHistory } = params
  const client = getOpenAIClient()

  const relevantFiles = retrieveRelevantFiles(question, repoSnapshot)
  const context = relevantFiles
    .map((f) => `=== ${f.path} ===\n${f.content.slice(0, 3000)}`)
    .join("\n\n")

  const systemPrompt = `You are a helpful engineering assistant with deep knowledge of the ${repoSnapshot.metadata.fullName} codebase.
Answer questions accurately and concisely. Reference specific files and line patterns when relevant.
When showing code, use markdown code blocks with the appropriate language tag.
When mentioning file paths, wrap them in backticks.

## Relevant Code Context
${context}`

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: question },
  ]

  const stream = await client.chat.completions.create(
    {
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: 1500,
    },
    { timeout: 30000 }
  )

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
      controller.close()
    },
  })
}
