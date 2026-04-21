import * as fs from "fs-extra"
import * as path from "path"

export interface EnvEntry {
  key: string
  value: string
  comment?: string
}

export function parseEnvFile(content: string): EnvEntry[] {
  const entries: EnvEntry[] = []
  let pendingComment = ""

  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line) {
      pendingComment = ""
      continue
    }
    if (line.startsWith("#")) {
      pendingComment = line.slice(1).trim()
      continue
    }
    const eqIdx = line.indexOf("=")
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    const value = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    entries.push({ key, value, comment: pendingComment || undefined })
    pendingComment = ""
  }
  return entries
}

export async function loadEnvFile(filePath: string): Promise<EnvEntry[]> {
  if (!(await fs.pathExists(filePath))) return []
  const content = await fs.readFile(filePath, "utf8")
  return parseEnvFile(content)
}

export async function writeEnvFile(filePath: string, entries: EnvEntry[]): Promise<void> {
  const lines: string[] = []
  for (const { key, value, comment } of entries) {
    if (comment) lines.push(`# ${comment}`)
    lines.push(`${key}=${value}`)
  }
  await fs.writeFile(filePath, lines.join("\n") + "\n", "utf8")
}

export async function getMissingEnvKeys(cwd: string): Promise<string[]> {
  const examplePath = path.join(cwd, ".env.example")
  const localPath = path.join(cwd, ".env.local")

  if (!(await fs.pathExists(examplePath))) return []

  const example = await loadEnvFile(examplePath)
  const local = await loadEnvFile(localPath)
  const localKeys = new Set(local.map((e) => e.key))

  return example
    .filter((e) => e.key && !localKeys.has(e.key))
    .map((e) => e.key)
}

export async function copyEnvExample(cwd: string): Promise<boolean> {
  const examplePath = path.join(cwd, ".env.example")
  const localPath = path.join(cwd, ".env.local")

  if (!(await fs.pathExists(examplePath))) return false
  if (await fs.pathExists(localPath)) return false

  await fs.copyFile(examplePath, localPath)
  return true
}

export async function validateEnvStructure(cwd: string): Promise<{
  missing: string[]
  empty: string[]
  configured: number
  total: number
}> {
  const examplePath = path.join(cwd, ".env.example")
  const localPath = path.join(cwd, ".env.local")

  if (!(await fs.pathExists(examplePath))) {
    return { missing: [], empty: [], configured: 0, total: 0 }
  }

  const example = await loadEnvFile(examplePath)
  const local = await loadEnvFile(localPath)
  const localMap = new Map(local.map((e) => [e.key, e.value]))

  const missing: string[] = []
  const empty: string[] = []
  let configured = 0

  for (const { key } of example) {
    if (!key) continue
    if (!localMap.has(key)) {
      missing.push(key)
    } else if (!localMap.get(key)) {
      empty.push(key)
    } else {
      configured++
    }
  }

  return { missing, empty, configured, total: example.filter((e) => e.key).length }
}
