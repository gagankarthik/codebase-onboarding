import { z } from "zod"
import type { Guide, Onboarding, RepoSnapshot, GitHubIssue } from "@/types"
import { getOpenAIClient } from "./client"

const GuideSchema = z.object({
  architectureOverview: z.string(),
  keyModules: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      purpose: z.string(),
      relevantForRole: z.boolean(),
    })
  ),
  codingConventions: z.array(z.string()),
  setupSteps: z.array(z.string()),
  starterTasks: z.array(
    z.object({
      issueNumber: z.number(),
      title: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      why: z.string(),
      url: z.string(),
    })
  ),
  firstWeekFocus: z.string(),
})

type GuideData = z.infer<typeof GuideSchema>

function buildSystemPrompt(
  snapshot: RepoSnapshot,
  onboarding: Onboarding,
  issues: GitHubIssue[]
): string {
  const fileTree = snapshot.tree.slice(0, 200).join("\n")
  const fileContents = snapshot.files
    .map((f) => `=== ${f.path} ===\n${f.content}`)
    .join("\n\n")
    .slice(0, 80000)

  const issueList = issues
    .slice(0, 10)
    .map((i) => `#${i.number}: ${i.title} — ${i.html_url}`)
    .join("\n")

  return `You are a senior engineer creating a personalized onboarding guide for a new hire joining a software team.

## New Hire Details
- Name: ${onboarding.newHireName}
- Role: ${onboarding.role}
- Team: ${onboarding.team}
- First Sprint Focus: ${onboarding.firstSprintFocus}

## Repository: ${snapshot.metadata.fullName}
Language: ${snapshot.metadata.language}
Description: ${snapshot.metadata.description}

## File Tree
\`\`\`
${fileTree}
\`\`\`

## Key File Contents
${fileContents}

## Open Issues (Good First Issues / Help Wanted)
${issueList || "No labelled starter issues found."}

Generate a comprehensive, personalized onboarding guide. Return a JSON object with these exact fields:
- architectureOverview: A clear 3-5 paragraph explanation of the system architecture, written for the new hire's role
- keyModules: Array of 6-10 important modules/directories with name, path, purpose, relevantForRole (boolean based on their role)
- codingConventions: Array of 5-8 specific coding conventions observed in this codebase
- setupSteps: Array of 6-10 concrete steps to set up the development environment
- starterTasks: Array of up to 3 starter tasks from the issues list with issueNumber, title, difficulty (easy/medium/hard), why (why this task is good for them), url
- firstWeekFocus: 2-3 sentences describing what they should focus on in their first week given their role and sprint focus

Be specific to this codebase. Do not write generic content.`
}

async function callOpenAI(prompt: string): Promise<GuideData> {
  const client = getOpenAIClient()
  const response = await client.chat.completions.create(
    {
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    },
    { timeout: 60000 }
  )
  const raw = response.choices[0]?.message?.content ?? "{}"
  return GuideSchema.parse(JSON.parse(raw))
}

export async function generateGuide(params: {
  repoSnapshot: RepoSnapshot
  onboarding: Onboarding
  openIssues: GitHubIssue[]
}): Promise<Omit<Guide, "guideId" | "onboardingId" | "generatedAt" | "version">> {
  const prompt = buildSystemPrompt(params.repoSnapshot, params.onboarding, params.openIssues)

  let data: GuideData
  try {
    data = await callOpenAI(prompt)
  } catch {
    data = await callOpenAI(prompt)
  }

  return data
}
