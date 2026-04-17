import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRemoteJWKSet, jwtVerify } from "jose"

const PROTECTED_PATHS = ["/dashboard", "/repos", "/onboarding", "/settings", "/api/repos", "/api/onboarding", "/api/guide", "/api/chat"]
const AUTH_PATHS = ["/sign-in", "/sign-up"]

const jwksCache = new Map<string, { keys: ReturnType<typeof createRemoteJWKSet>; fetchedAt: number }>()

function getJWKS(region: string, userPoolId: string) {
  const cacheKey = `${region}:${userPoolId}`
  const cached = jwksCache.get(cacheKey)
  const now = Date.now()
  if (cached && now - cached.fetchedAt < 3600000) return cached.keys

  const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  const keys = createRemoteJWKSet(new URL(url))
  jwksCache.set(cacheKey, { keys, fetchedAt: now })
  return keys
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))

  const token =
    request.cookies.get("CognitoAccessToken")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "")

  if (isProtected) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/sign-in"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    try {
      const region = process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1"
      const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ""
      const jwks = getJWKS(region, userPoolId)
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      })

      const response = NextResponse.next()
      response.headers.set("x-user-id", (payload["sub"] as string) ?? "")
      return response
    } catch {
      const url = request.nextUrl.clone()
      url.pathname = "/sign-in"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (isAuthPath && token) {
    try {
      const region = process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1"
      const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ""
      const jwks = getJWKS(region, userPoolId)
      await jwtVerify(token, jwks, {
        issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      })
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    } catch {
      // Token invalid, continue to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
