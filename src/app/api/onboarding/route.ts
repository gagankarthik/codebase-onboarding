import { NextRequest, NextResponse } from "next/server"
import { getReposByUserId } from "@/lib/db/repos"
import { getOnboardingsByRepoId } from "@/lib/db/onboardings"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const repos = await getReposByUserId(userId)
  const allOnboardings = await Promise.all(repos.map((r) => getOnboardingsByRepoId(r.repoId)))
  const onboardings = allOnboardings.flat()

  return NextResponse.json({ onboardings })
}
