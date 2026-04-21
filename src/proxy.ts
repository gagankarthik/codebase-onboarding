import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { SESSION_COOKIE } from "@/lib/auth/session"

const PROTECTED_PATHS = [
  "/dashboard",
  "/repos",
  "/onboarding",
  "/settings",
  "/api/repos",
  "/api/onboarding",
  "/api/guide",
  "/api/chat",
  "/api/github",
  "/api/security",
  "/api/events",
  "/api/analytics",
]

// Sub-paths of protected routes that are public (use their own auth e.g. API key)
const PUBLIC_SUBPATHS = ["/api/events/ingest", "/api/analytics/collect"]
const AUTH_PATHS = ["/sign-in"]

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "fallback-dev-secret-change-in-prod")
}

async function getSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { userId?: string; githubToken?: string }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const isPublicSubpath = PUBLIC_SUBPATHS.some((p) => pathname.startsWith(p))
  const isProtected = !isPublicSubpath && PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value

  if (isProtected) {
    if (!sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/sign-in"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    const session = await getSession(sessionToken)
    if (!session?.userId) {
      const url = request.nextUrl.clone()
      url.pathname = "/sign-in"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    const response = NextResponse.next()
    response.headers.set("x-user-id", session.userId)
    if (session.githubToken) {
      response.headers.set("x-github-token", session.githubToken)
    }
    return response
  }

  if (isAuthPath && sessionToken) {
    const session = await getSession(sessionToken)
    if (session?.userId) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
