import {
  GetCommand, PutCommand, QueryCommand, UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { PageViewRecord, AnalyticsSession } from "@/types"
import { generateId } from "@/lib/utils"

const PV_TABLE = tableName("analytics-pageviews")
const SE_TABLE = tableName("analytics-sessions")

// ── page views ────────────────────────────────────────────────────────────────

export async function recordPageView(
  data: Omit<PageViewRecord, "pvId" | "timestamp">
): Promise<PageViewRecord> {
  const record: PageViewRecord = {
    ...data,
    pvId: generateId(),
    timestamp: new Date().toISOString(),
  }
  await getDocumentClient().send(new PutCommand({ TableName: PV_TABLE, Item: record }))
  return record
}

export async function getPageViewsInRange(
  repoId: string,
  from: string,
  to: string,
  limit = 5000
): Promise<PageViewRecord[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: PV_TABLE,
      IndexName: "repoId-timestamp-index",
      KeyConditionExpression: "repoId = :r AND #ts BETWEEN :from AND :to",
      ExpressionAttributeNames: { "#ts": "timestamp" },
      ExpressionAttributeValues: { ":r": repoId, ":from": from, ":to": to },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items as PageViewRecord[]) ?? []
}

export async function updatePageViewDuration(pvId: string, duration: number): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: PV_TABLE,
      Key: { pvId },
      UpdateExpression: "SET #d = :d",
      ExpressionAttributeNames: { "#d": "duration" },
      ExpressionAttributeValues: { ":d": duration },
    })
  )
}

// ── sessions ─────────────────────────────────────────────────────────────────

export async function upsertSession(
  sessionId: string,
  repoId: string
): Promise<AnalyticsSession> {
  const now = new Date().toISOString()

  // Try to get existing session
  const existing = await getDocumentClient().send(
    new GetCommand({ TableName: SE_TABLE, Key: { sessionId } })
  )

  if (existing.Item) {
    await getDocumentClient().send(
      new UpdateCommand({
        TableName: SE_TABLE,
        Key: { sessionId },
        UpdateExpression: "SET pageCount = pageCount + :one, lastSeenAt = :now",
        ExpressionAttributeValues: { ":one": 1, ":now": now },
      })
    )
    return { ...(existing.Item as AnalyticsSession), pageCount: (existing.Item as AnalyticsSession).pageCount + 1, lastSeenAt: now }
  }

  const session: AnalyticsSession = {
    sessionId,
    repoId,
    pageCount: 1,
    startedAt: now,
    lastSeenAt: now,
  }
  await getDocumentClient().send(new PutCommand({ TableName: SE_TABLE, Item: session }))
  return session
}

export async function getActiveSessionCount(repoId: string): Promise<number> {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: SE_TABLE,
      IndexName: "repoId-lastSeenAt-index",
      KeyConditionExpression: "repoId = :r AND lastSeenAt > :since",
      ExpressionAttributeValues: { ":r": repoId, ":since": since },
      Select: "COUNT",
    })
  )
  return result.Count ?? 0
}

export async function getSessionsInRange(
  repoId: string,
  from: string,
  to: string,
  limit = 5000
): Promise<AnalyticsSession[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: SE_TABLE,
      IndexName: "repoId-lastSeenAt-index",
      KeyConditionExpression: "repoId = :r AND lastSeenAt BETWEEN :from AND :to",
      ExpressionAttributeValues: { ":r": repoId, ":from": from, ":to": to },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items as AnalyticsSession[]) ?? []
}
