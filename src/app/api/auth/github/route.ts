import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const purpose = searchParams.get("purpose") // "repo_connect" or null
  const redirect = searchParams.get("redirect") ?? "/dashboard"

  // Encode purpose + redirect in state so the single callback URL can route correctly
  const state = purpose === "repo_connect" ? "repo_connect" : redirect

  const callbackUrl =
    process.env.GITHUB_REDIRECT_URI ??
    `${process.env.NEXTAUTH_URL}/api/auth/callback`

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: callbackUrl,
    scope: "read:user user:email repo admin:repo_hook",
    state,
  })

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  )
}
