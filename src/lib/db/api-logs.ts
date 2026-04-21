import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { ApiLog } from "@/types"
import { randomUUID } from "crypto"

const TABLE = tableName("api-logs")

export async function logApiCall(
  data: Omit<ApiLog, "logId" | "timestamp">
): Promise<void> {
  const item: ApiLog = {
    ...data,
    logId: randomUUID(),
    timestamp: new Date().toISOString(),
  }
  try {
    await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  } catch {
    // Never let logging failures break the request
  }
}

export async function getApiLogsByUser(
  userId: string,
  limit = 100
): Promise<ApiLog[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "userId-timestamp-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items ?? []) as ApiLog[]
}
