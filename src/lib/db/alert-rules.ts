import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { getDocumentClient, tableName } from "./client"
import type { AlertRule } from "@/types"
import { randomUUID } from "crypto"

const TABLE = tableName("alert-rules")

export async function createAlertRule(
  data: Omit<AlertRule, "ruleId" | "triggeredCount" | "createdAt">
): Promise<AlertRule> {
  const rule: AlertRule = {
    ...data,
    ruleId: randomUUID(),
    triggeredCount: 0,
    createdAt: new Date().toISOString(),
  }
  await getDocumentClient().send(new PutCommand({ TableName: TABLE, Item: rule }))
  return rule
}

export async function getAlertRuleById(ruleId: string): Promise<AlertRule | null> {
  const result = await getDocumentClient().send(
    new GetCommand({ TableName: TABLE, Key: { ruleId } })
  )
  return (result.Item as AlertRule) ?? null
}

export async function getAlertRulesByRepoId(repoId: string): Promise<AlertRule[]> {
  const result = await getDocumentClient().send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "repoId-createdAt-index",
      KeyConditionExpression: "repoId = :repoId",
      ExpressionAttributeValues: { ":repoId": repoId },
      ScanIndexForward: false,
    })
  )
  return (result.Items ?? []) as AlertRule[]
}

export async function updateAlertRule(
  ruleId: string,
  updates: Partial<Pick<AlertRule, "name" | "threshold" | "windowMinutes" | "action" | "actionTarget" | "enabled">>
): Promise<void> {
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return

  const expr = entries.map(([k], i) => `#f${i} = :v${i}`).join(", ")
  const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { ruleId },
      UpdateExpression: `SET ${expr}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}

export async function incrementAlertTrigger(ruleId: string): Promise<void> {
  await getDocumentClient().send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { ruleId },
      UpdateExpression: "SET triggeredCount = triggeredCount + :one, lastTriggeredAt = :now",
      ExpressionAttributeValues: { ":one": 1, ":now": new Date().toISOString() },
    })
  )
}

export async function deleteAlertRule(ruleId: string): Promise<void> {
  await getDocumentClient().send(
    new DeleteCommand({ TableName: TABLE, Key: { ruleId } })
  )
}
