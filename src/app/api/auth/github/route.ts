import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const redirect = searchParams.get("redirect") ?? "/dashboard"

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: process.env.GITHUB_REDIRECT_URI ?? `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    scope: "read:user user:email repo",
    state: encodeURIComponent(redirect),
  })

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  )
}
