import { NextRequest, NextResponse } from "next/server"

interface SyncPayload {
  projectName: string
  nodeVersion: string
  npmVersion: string
  dependenciesInstalled: boolean
  vulnerabilityCount: number
  envConfigured: boolean
  gitCommitCount: number
  firstPrCreated: boolean
  timestamp: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const apiKey = authHeader.slice(7)
  if (!apiKey.startsWith("coa_")) {
    return NextResponse.json({ error: "Invalid API key format" }, { status: 401 })
  }

  let body: SyncPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const required = [
    "projectName",
    "nodeVersion",
    "npmVersion",
    "dependenciesInstalled",
    "vulnerabilityCount",
    "envConfigured",
    "gitCommitCount",
    "firstPrCreated",
    "timestamp",
  ]
  for (const field of required) {
    if (!(field in body)) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
    }
  }

  return NextResponse.json({
    success: true,
    synced: {
      project: body.projectName,
      at: body.timestamp,
      score: computeScore(body),
    },
    dashboardUrl: `${request.nextUrl.origin}/dashboard`,
  })
}

function computeScore(p: SyncPayload): number {
  let score = 0
  if (p.dependenciesInstalled) score += 25
  if (p.envConfigured) score += 25
  if (p.vulnerabilityCount === 0) score += 20
  if (p.gitCommitCount >= 2) score += 15
  if (p.firstPrCreated) score += 15
  return score
}
