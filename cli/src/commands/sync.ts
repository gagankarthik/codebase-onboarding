import * as path from "path"
import chalk from "chalk"
import { log, spinner, section, table } from "../utils/terminal"
import { readConfig, writeConfig, syncProgress } from "../utils/api"
import {
  getSystemInfo,
  getDependencyStatus,
  runNpmAudit,
  getGitCommitCount,
  getProjectName,
} from "../utils/system"
import { validateEnvStructure } from "../utils/env"
import * as fs from "fs-extra"

interface SyncOptions {
  apiKey?: string
  apiUrl?: string
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(chalk.bold("  ☁️  OnboardAI — Sync with Dashboard"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  // Resolve API key and URL — flag wins, then config, then default
  const config = await readConfig()
  let apiKey = options.apiKey ?? config.apiKey
  const apiUrl = options.apiUrl ?? config.apiUrl

  if (!apiKey) {
    log.error("No API key provided.")
    log.muted("Pass it with --api-key <key> or save it permanently:")
    log.muted("  onboardai sync --api-key <your-key>")
    log.muted("")
    log.muted("Get your API key from Settings → API tab in your dashboard")
    console.log()
    return
  }

  // Persist any new values
  const needsWrite = config.apiKey !== apiKey || (apiUrl && config.apiUrl !== apiUrl)
  if (needsWrite) {
    await writeConfig({ ...config, apiKey, ...(apiUrl ? { apiUrl } : {}) })
    log.success("API key saved for future syncs")
  }

  // Gather data
  const s = spinner("Gathering local data...").start()
  const [sys, deps, audit, envStatus, gitCommits, projectName] = await Promise.all([
    getSystemInfo(),
    getDependencyStatus(cwd),
    runNpmAudit(cwd),
    validateEnvStructure(cwd),
    getGitCommitCount(cwd),
    getProjectName(cwd),
  ])
  s.stop()

  // Load onboarding profile
  const profilePath = path.join(cwd, ".onboardai.json")
  let firstPrCreated = false
  if (await fs.pathExists(profilePath)) {
    const profile = await fs.readJson(profilePath)
    firstPrCreated = !!profile.firstPrCreated
  }

  const payload = {
    projectName,
    nodeVersion: sys.nodeVersion,
    npmVersion: sys.npmVersion,
    dependenciesInstalled: deps.nodeModulesExists,
    vulnerabilityCount: audit.vulnerabilities,
    envConfigured: envStatus.configured === envStatus.total && envStatus.total > 0,
    gitCommitCount: gitCommits,
    firstPrCreated,
    timestamp: new Date().toISOString(),
  }

  // Show preview
  section("Syncing the following data")
  table([
    ["Project", projectName],
    ["Node.js", sys.nodeVersion],
    ["Dependencies", deps.nodeModulesExists ? "Installed" : "Missing"],
    ["Vulnerabilities", audit.vulnerabilities.toString()],
    ["Env configured", `${envStatus.configured}/${envStatus.total}`],
    ["Git commits", gitCommits.toString()],
    ["First PR", firstPrCreated ? "Yes" : "Not yet"],
  ])

  // Send to API
  const s2 = spinner("Syncing with OnboardAI dashboard...").start()
  try {
    await syncProgress(payload, apiKey)
    s2.succeed("Progress synced successfully!")
    console.log()
    const baseUrl = apiUrl ?? "https://app.onboardai.dev"
    log.info(`View your onboarding dashboard at: ${baseUrl}/dashboard`)
  } catch (err) {
    s2.fail("Sync failed")
    const message = err instanceof Error ? err.message : "Unknown error"
    log.error(`Error: ${message}`)
    log.muted("Check your API key and internet connection, then try again.")
  }

  console.log()
}
