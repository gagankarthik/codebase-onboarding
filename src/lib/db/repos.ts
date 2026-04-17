import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { Repo } from "@/types"

const TABLE = tableName("repos")

export async function createRepo(repo: Omit<Repo, "createdAt">): Promise<Repo> {
  const now = new Date().toISOString()
  const item: Repo = { ...repo, createdAt: now }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  return item
}

export async function getRepoById(repoId: string): Promise<Repo | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { repoId } })
  )
  return (result.Item as Repo) ?? null
}

export async function getReposByUserId(userId: string): Promise<Repo[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    })
  )
  return (result.Items as Repo[]) ?? []
}

export async function updateRepo(repoId: string, updates: Partial<Repo>): Promise<void> {
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return

  const setExpression = entries.map(([k], i) => `#k${i} = :v${i}`).join(", ")
  const names = Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { repoId },
      UpdateExpression: `SET ${setExpression}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}

export async function deleteRepo(repoId: string): Promise<void> {
  await getDocumentClient().send(
    new DeleteCommand({ TableName: TABLE, Key: { repoId } })
  )
}
