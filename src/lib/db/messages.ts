import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { ChatMessage } from "@/types"
import { generateId } from "@/lib/utils"

const TABLE = tableName("messages")

export async function createMessage(
  data: Omit<ChatMessage, "messageId" | "createdAt">
): Promise<ChatMessage> {
  const now = new Date().toISOString()
  const item: ChatMessage = { ...data, messageId: generateId(), createdAt: now }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  return item
}

export async function getMessagesByOnboardingId(onboardingId: string): Promise<ChatMessage[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "onboardingId-index",
      KeyConditionExpression: "onboardingId = :onboardingId",
      ExpressionAttributeValues: { ":onboardingId": onboardingId },
      ScanIndexForward: true,
    })
  )
  return (result.Items as ChatMessage[]) ?? []
}
