import { z } from "zod"
import type { WebEvent, EventAnalysis, Guide } from "@/types"
import { getOpenAIClient } from "./client"

const AnalysisSchema = z.object({
  explanation: z.string(),
  rootCause: z.string(),
  affectedFile: z.string().optional(),
  affectedLine: z.number().optional(),
  suggestedFix: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
})

function buildPrompt(event: WebEvent, guide: Guide | null, repoFullName: string): string {
  const guideContext = guide
    ? `
Repository: ${repoFullName}
Architecture: ${guide.architectureOverview.slice(0, 800)}
Key modules:
${guide.keyModules
  .slice(0, 8)
  .map((m) => `  - ${m.path}: ${m.purpose}`)
  .join("\n")}
Coding conventions: ${guide.codingConventions.slice(0, 5).join(", ")}
`
    : `Repository: ${repoFullName}`

  return `You are a senior engineer analyzing a runtime error from a production web application.

${guideContext}

Error details:
- Type: ${event.type}
- Message: ${event.message}
${event.filename ? `- File: ${event.filename}` : ""}
${event.lineno ? `- Line: ${event.lineno}, Column: ${event.colno ?? "?"}` : ""}
${event.url ? `- URL: ${event.url}` : ""}
${event.stack ? `- Stack trace:\n${event.stack.slice(0, 1500)}` : ""}
${event.metadata ? `- Metadata: ${JSON.stringify(event.metadata)}` : ""}

Respond with a JSON object matching this exact schema:
{
  "explanation": "Plain-English explanation of what went wrong (2-3 sentences)",
  "rootCause": "The specific root cause — be precise (1 sentence)",
  "affectedFile": "Most likely source file path, if determinable (omit if unknown)",
  "affectedLine": "Line number as integer, if determinable (omit if unknown)",
  "suggestedFix": "Concrete code fix or action to resolve this (2-4 sentences)",
  "confidence": "high | medium | low — your confidence in this analysis"
}

Be specific and actionable. If the stack trace points to a file, use it. Reference the repo's architecture when relevant.`
}

export async function analyzeEvent(
  event: WebEvent,
  guide: Guide | null,
  repoFullName: string
): Promise<EventAnalysis> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: "You are a senior software engineer. Analyze errors and respond with valid JSON only.",
      },
      {
        role: "user",
        content: buildPrompt(event, guide, repoFullName),
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? "{}"
  const parsed = AnalysisSchema.safeParse(JSON.parse(raw))

  if (!parsed.success) {
    return {
      explanation: "Unable to parse AI analysis. The error may be from a third-party dependency.",
      rootCause: event.message,
      suggestedFix: "Check the stack trace and search the codebase for the affected file.",
      confidence: "low",
    }
  }

  return parsed.data
}
