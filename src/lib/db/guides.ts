import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { Guide } from "@/types"
import { generateId } from "@/lib/utils"

const TABLE = tableName("guides")

export async function createGuide(
  data: Omit<Guide, "guideId" | "generatedAt" | "version">
): Promise<Guide> {
  const now = new Date().toISOString()
  const item: Guide = { ...data, guideId: generateId(), generatedAt: now, version: 1 }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  return item
}

export async function getGuideByOnboardingId(onboardingId: string): Promise<Guide | null> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "onboardingId-index",
      KeyConditionExpression: "onboardingId = :onboardingId",
      ExpressionAttributeValues: { ":onboardingId": onboardingId },
      Limit: 1,
    })
  )
  return (result.Items?.[0] as Guide) ?? null
}

export async function updateGuide(guideId: string, data: Partial<Guide>): Promise<void> {
  const updates = { ...data, generatedAt: new Date().toISOString() }
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return

  const setExpression = entries.map(([k], i) => `#k${i} = :v${i}`).join(", ")
  const names = Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { guideId },
      UpdateExpression: `SET ${setExpression}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}
