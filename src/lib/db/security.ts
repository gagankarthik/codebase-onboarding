import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { SecurityScan } from "@/types"

const TABLE = tableName("security-scans")

export async function saveSecurityScan(scan: SecurityScan): Promise<SecurityScan> {
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: scan }))
  return scan
}

export async function getSecurityScanById(scanId: string): Promise<SecurityScan | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { scanId } })
  )
  return (result.Item as SecurityScan) ?? null
}

export async function getLatestScanByRepoId(repoId: string): Promise<SecurityScan | null> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-scannedAt-index",
      KeyConditionExpression: "repoId = :repoId",
      ExpressionAttributeValues: { ":repoId": repoId },
      ScanIndexForward: false,
      Limit: 1,
    })
  )
  const items = result.Items as SecurityScan[] | undefined
  return items?.[0] ?? null
}

export async function getScansByRepoId(repoId: string, limit = 10): Promise<SecurityScan[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-scannedAt-index",
      KeyConditionExpression: "repoId = :repoId",
      ExpressionAttributeValues: { ":repoId": repoId },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items as SecurityScan[]) ?? []
}
