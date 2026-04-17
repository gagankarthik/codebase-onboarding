import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { Onboarding } from "@/types"
import { generateId } from "@/lib/utils"

const TABLE = tableName("onboardings")

export async function createOnboarding(
  data: Omit<Onboarding, "onboardingId" | "createdAt">
): Promise<Onboarding> {
  const now = new Date().toISOString()
  const item: Onboarding = { ...data, onboardingId: generateId(), createdAt: now }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  return item
}

export async function getOnboardingById(onboardingId: string): Promise<Onboarding | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { onboardingId } })
  )
  return (result.Item as Onboarding) ?? null
}

export async function getOnboardingsByRepoId(repoId: string): Promise<Onboarding[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-index",
      KeyConditionExpression: "repoId = :repoId",
      ExpressionAttributeValues: { ":repoId": repoId },
    })
  )
  return (result.Items as Onboarding[]) ?? []
}

export async function updateOnboardingStatus(
  onboardingId: string,
  status: Onboarding["status"]
): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { onboardingId },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  )
}

export async function markFirstPR(onboardingId: string): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { onboardingId },
      UpdateExpression: "SET firstPrAt = :firstPrAt",
      ExpressionAttributeValues: { ":firstPrAt": new Date().toISOString() },
    })
  )
}
