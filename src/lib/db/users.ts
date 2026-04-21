import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { User } from "@/types"
import { randomBytes } from "crypto"

const TABLE = tableName("users")

export async function createUser(user: Omit<User, "createdAt">): Promise<User> {
  const now = new Date().toISOString()
  const item: User = { ...user, createdAt: now }
  await getDocumentClient().send(
    new PutCommand({ TableName: TABLE, Item: item, ConditionExpression: "attribute_not_exists(userId)" })
  )
  return item
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { userId } })
  )
  return (result.Item as User) ?? null
}

export async function updateUserPlan(userId: string, plan: User["plan"]): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId },
      UpdateExpression: "SET #plan = :plan",
      ExpressionAttributeNames: { "#plan": "plan" },
      ExpressionAttributeValues: { ":plan": plan },
    })
  )
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string }
): Promise<void> {
  if (!updates.name) return
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId },
      UpdateExpression: "SET #name = :name",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: { ":name": updates.name },
    })
  )
}

function generateApiKey(): string {
  return `coa_${randomBytes(20).toString("hex")}`
}

export async function getOrCreateApiKey(userId: string): Promise<string> {
  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")
  if (user.apiKey) return user.apiKey

  const apiKey = generateApiKey()
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId },
      UpdateExpression: "SET apiKey = :apiKey",
      ExpressionAttributeValues: { ":apiKey": apiKey },
    })
  )
  return apiKey
}

export async function regenerateApiKey(userId: string): Promise<string> {
  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")

  const apiKey = generateApiKey()
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId },
      UpdateExpression: "SET apiKey = :apiKey",
      ExpressionAttributeValues: { ":apiKey": apiKey },
    })
  )
  return apiKey
}
