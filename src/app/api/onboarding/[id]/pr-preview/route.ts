import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { getOnboardingById } from "@/lib/db/onboardings"
import { getRepoById } from "@/lib/db/repos"
import { getGuideByOnboardingId } from "@/lib/db/guides"
import { getOpenAIClient } from "@/lib/openai/client"
import { getGitHubClient } from "@/lib/github/client"

const BodySchema = z.object({
  description: z.string().min(10).max(1000),
})

const PreviewSchema = z.object({
  title: z.string(),
  body: z.string(),
  reviewers: z.array(z.string()),
  labels: z.array(z.string()),
})

async function getCodeowners(token: string, fullName: string): Promise<string[]> {
  try {
    const octokit = getGitHubClient(token)
    const [owner, repo] = fullName.split("/")
    const { data } = await octokit.repos.getContent({ owner, repo, path: "CODEOWNERS" })
    if ("content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf8")
      const handles = content
        .split("\n")
        .flatMap((line) => line.split(/\s+/).filter((t) => t.startsWith("@")))
        .map((h) => h.replace("@", ""))
        .filter(Boolean)
      return [...new Set(handles)].slice(0, 4)
    }
  } catch {}
  return []
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await verifySession(sessionToken)
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: onboardingId } = await params
  const body = await request.json() as unknown
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const onboarding = await getOnboardingById(onboardingId)
  if (!onboarding) return NextResponse.json({ error: "Onboarding not found" }, { status: 404 })

  const repo = await getRepoById(onboarding.repoId)
  if (!repo || repo.userId !== session.userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const guide = await getGuideByOnboardingId(onboardingId)
  const codeowners = await getCodeowners(session.githubToken, repo.fullName)

  const context = guide
    ? `Architecture: ${guide.architectureOverview.slice(0, 500)}\nConventions: ${guide.codingConventions.slice(0, 3).join("; ")}`
    : `Repository: ${repo.fullName}`

  const prompt = `You are helping a new engineer (${onboarding.newHireName}, ${onboarding.role}) write their first pull request description.

Repository: ${repo.fullName}
Context: ${context}

What they are working on: ${parsed.data.description}

Generate a professional PR description. Return JSON with:
- title: concise PR title (under 70 chars, imperative verb)
- body: full markdown PR body with sections: ## Summary (3 bullet points), ## Changes (what was changed), ## How to Test (numbered steps), ## Notes (any caveats)
- reviewers: array of suggested reviewer GitHub handles (use these if available: ${codeowners.join(", ") || "none"}, else suggest 1-2 fictional realistic names)
- labels: array of appropriate labels like "feature", "bug", "docs", "chore", "enhancement"

Be specific and professional. Match the project's codebase context.`

  try {
    const client = getOpenAIClient()
    const response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      },
      { timeout: 30000 }
    )

    const raw = response.choices[0]?.message?.content ?? "{}"
    const preview = PreviewSchema.parse(JSON.parse(raw))
    return NextResponse.json({ preview })
  } catch {
    return NextResponse.json({ error: "Failed to generate PR preview" }, { status: 500 })
  }
}
