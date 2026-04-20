import { NextRequest, NextResponse } from "next/server"
import { createSession, SESSION_COOKIE, COOKIE_OPTIONS } from "@/lib/auth/session"
import { createUser, getUserById } from "@/lib/db/users"

async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI ?? `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(data.error ?? "No access token returned")
  return data.access_token
}

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  return res.json() as Promise<GitHubUser>
}

async function fetchGitHubEmail(token: string): Promise<string> {
  const res = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  const emails = await res.json() as { email: string; primary: boolean; verified: boolean }[]
  const primary = emails.find((e) => e.primary && e.verified)
  return primary?.email ?? emails[0]?.email ?? ""
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", request.url))
  }

  try {
    const accessToken = await exchangeCodeForToken(code)
    const ghUser = await fetchGitHubUser(accessToken)

    let email = ghUser.email ?? ""
    if (!email) email = await fetchGitHubEmail(accessToken)

    const userId = `gh_${ghUser.id}`
    let user = await getUserById(userId)
    if (!user) {
      user = await createUser({
        userId,
        email,
        name: ghUser.name ?? ghUser.login,
        plan: "starter",
      })
    }

    const sessionToken = await createSession({
      userId: user.userId,
      name: user.name,
      email: user.email,
      avatar: ghUser.avatar_url,
      githubToken: accessToken,
    })

    // If the OAuth flow was initiated for repo connection, go to repo picker
    const redirectTo = state === "repo_connect" ? "/repos/select" : state

    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    response.cookies.set(SESSION_COOKIE, sessionToken, COOKIE_OPTIONS)
    return response
  } catch (err) {
    console.error("[auth/callback] error:", err)
    return NextResponse.redirect(new URL("/sign-in?error=auth_failed", request.url))
  }
}
