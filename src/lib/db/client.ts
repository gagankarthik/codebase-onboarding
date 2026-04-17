import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

let client: DynamoDBDocumentClient | null = null

export function getDocumentClient(): DynamoDBDocumentClient {
  if (!client) {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    })
    client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: { removeUndefinedValues: true },
    })
  }
  return client
}

export function tableName(name: string): string {
  const prefix = process.env.DYNAMODB_TABLE_PREFIX ?? "coa"
  return `${prefix}-${name}`
}
