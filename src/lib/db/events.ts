import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { WebEvent, EventAnalysis } from "@/types"
import { generateId } from "@/lib/utils"

const TABLE = tableName("web-events")

export async function createEvent(
  data: Omit<WebEvent, "eventId" | "createdAt">
): Promise<WebEvent> {
  const event: WebEvent = {
    ...data,
    eventId: generateId(),
    createdAt: new Date().toISOString(),
  }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: event }))
  return event
}

export async function getEventById(eventId: string): Promise<WebEvent | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { eventId } })
  )
  return (result.Item as WebEvent) ?? null
}

export async function getEventsByRepoId(
  repoId: string,
  limit = 50,
  since?: string
): Promise<WebEvent[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-createdAt-index",
      KeyConditionExpression: since
        ? "repoId = :repoId AND createdAt > :since"
        : "repoId = :repoId",
      ExpressionAttributeValues: since
        ? { ":repoId": repoId, ":since": since }
        : { ":repoId": repoId },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items as WebEvent[]) ?? []
}

export async function getErrorEventsByRepoId(repoId: string, limit = 20): Promise<WebEvent[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-createdAt-index",
      KeyConditionExpression: "repoId = :repoId",
      FilterExpression: "#t IN (:error, :api_error)",
      ExpressionAttributeNames: { "#t": "type" },
      ExpressionAttributeValues: {
        ":repoId": repoId,
        ":error": "error",
        ":api_error": "api_error",
      },
      ScanIndexForward: false,
      Limit: limit * 4,
    })
  )
  const items = (result.Items as WebEvent[]) ?? []
  return items.slice(0, limit)
}

export async function saveEventAnalysis(
  eventId: string,
  analysis: EventAnalysis
): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { eventId },
      UpdateExpression: "SET analysis = :analysis, analyzedAt = :at",
      ExpressionAttributeValues: {
        ":analysis": analysis,
        ":at": new Date().toISOString(),
      },
    })
  )
}

export async function getEventStats(
  repoId: string,
  sinceHours = 24
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString()
  const events = await getEventsByRepoId(repoId, 500, since)
  const counts: Record<string, number> = {
    error: 0,
    warning: 0,
    api_error: 0,
    page_view: 0,
    performance: 0,
    info: 0,
  }
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1
  return counts
}
