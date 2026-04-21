import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { CodebaseAnalysis } from "@/types"
import { randomUUID } from "crypto"

const TABLE = tableName("analysis")

export async function saveAnalysis(
  data: Omit<CodebaseAnalysis, "analysisId" | "analyzedAt">
): Promise<CodebaseAnalysis> {
  const item: CodebaseAnalysis = {
    ...data,
    analysisId: randomUUID(),
    analyzedAt: new Date().toISOString(),
  }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: item }))
  return item
}

export async function getAnalysisByRepoId(
  repoId: string
): Promise<CodebaseAnalysis | null> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-analyzedAt-index",
      KeyConditionExpression: "repoId = :repoId",
      ExpressionAttributeValues: { ":repoId": repoId },
      ScanIndexForward: false,
      Limit: 1,
    })
  )
  return ((result.Items ?? [])[0] as CodebaseAnalysis) ?? null
}

export async function getAnalysisById(analysisId: string): Promise<CodebaseAnalysis | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { analysisId } })
  )
  return (result.Item as CodebaseAnalysis) ?? null
}
