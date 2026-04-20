import { NextRequest, NextResponse } from "next/server"
import { getGitHubClient } from "@/lib/github/client"
import { createRepo, getReposByUserId } from "@/lib/db/repos"
import { generateId } from "@/lib/utils"
import { ingestRepo } from "@/lib/github/ingest"
import { updateRepo } from "@/lib/db/repos"
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session"
import { z } from "zod"

const ConnectSchema = z.object({
  fullName: z.string().min(1),
  branch: z.string().optional(),
  subfolder: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await verifySession(sessionToken)
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json() as unknown
  const parsed = ConnectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const { fullName, branch, subfolder } = parsed.data
  const accessToken = session.githubToken

  try {
    const octokit = getGitHubClient(accessToken)
    const { data: ghRepo } = await octokit.repos.get({
      owner: fullName.split("/")[0],
      repo: fullName.split("/")[1],
    })

    const existing = await getReposByUserId(session.userId)
    const alreadyConnected = existing.find((r) => r.githubRepoId === ghRepo.id)

    if (alreadyConnected) {
      return NextResponse.json({ repo: alreadyConnected })
    }

    const repo = await createRepo({
      repoId: generateId(),
      userId: session.userId,
      githubRepoId: ghRepo.id,
      fullName: ghRepo.full_name,
      description: ghRepo.description ?? undefined,
      language: ghRepo.language ?? undefined,
      stars: ghRepo.stargazers_count,
      branch: branch ?? ghRepo.default_branch,
      subfolder: subfolder,
    })

    ingestRepo(accessToken, ghRepo.full_name)
      .then(() => updateRepo(repo.repoId, { lastIngestedAt: new Date().toISOString() }))
      .catch(() => {})

    return NextResponse.json({ repo })
  } catch {
    return NextResponse.json({ error: "Failed to connect repository" }, { status: 500 })
  }
}
