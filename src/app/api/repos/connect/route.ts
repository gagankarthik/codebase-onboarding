import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getGitHubClient } from "@/lib/github/client"
import { createRepo, getReposByUserId } from "@/lib/db/repos"
import { generateId } from "@/lib/utils"
import { ingestRepo } from "@/lib/github/ingest"
import { updateRepo } from "@/lib/db/repos"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Missing code parameter" }, { status: 400 })

  const accessToken = await exchangeCodeForToken(code)
  const octokit = getGitHubClient(accessToken)
  const { data: ghUser } = await octokit.users.getAuthenticated()

  const { data: ghRepos } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 1,
  })

  const ghRepo = ghRepos[0]
  if (!ghRepo) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const existing = await getReposByUserId(userId)
  const alreadyConnected = existing.find((r) => r.githubRepoId === ghRepo.id)

  let repoId: string
  if (alreadyConnected) {
    repoId = alreadyConnected.repoId
  } else {
    const repo = await createRepo({
      repoId: generateId(),
      userId,
      githubRepoId: ghRepo.id,
      fullName: ghRepo.full_name,
      description: ghRepo.description ?? undefined,
      language: ghRepo.language ?? undefined,
      stars: ghRepo.stargazers_count,
    })
    repoId = repo.repoId

    ingestRepo(accessToken, ghRepo.full_name)
      .then(() => updateRepo(repoId, { lastIngestedAt: new Date().toISOString() }))
      .catch(() => {})
  }

  void ghUser
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
