import axios, { AxiosInstance } from "axios"
import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"

const CONFIG_DIR = path.join(os.homedir(), ".onboardai")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

interface Config {
  apiKey?: string
  apiUrl?: string
  userId?: string
}

export async function readConfig(): Promise<Config> {
  try {
    if (await fs.pathExists(CONFIG_FILE)) {
      return await fs.readJson(CONFIG_FILE)
    }
  } catch {
    // ignore
  }
  return {}
}

export async function writeConfig(config: Config): Promise<void> {
  await fs.ensureDir(CONFIG_DIR)
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 })
}

export function createApiClient(apiKey: string, baseURL = "https://app.onboardai.dev"): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "onboardai-cli/1.0.0",
    },
    timeout: 30_000,
  })
}

export async function getApiClient(): Promise<AxiosInstance | null> {
  const config = await readConfig()
  if (!config.apiKey) return null
  return createApiClient(config.apiKey, config.apiUrl)
}

export interface SyncPayload {
  projectName: string
  nodeVersion: string
  npmVersion: string
  dependenciesInstalled: boolean
  vulnerabilityCount: number
  envConfigured: boolean
  gitCommitCount: number
  firstPrCreated: boolean
  timestamp: string
}

export async function syncProgress(payload: SyncPayload, apiKey: string): Promise<void> {
  const config = await readConfig()
  const client = createApiClient(apiKey, config.apiUrl)
  await client.post("/api/cli/sync", payload)
}
