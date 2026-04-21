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
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(chalk.bold("  ☁️  OnboardAI — Sync with Dashboard"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  // Resolve API key
  let apiKey = options.apiKey
  if (!apiKey) {
    const config = await readConfig()
    apiKey = config.apiKey
  }

  if (!apiKey) {
    log.error("No API key provided.")
    log.muted("Pass it with --api-key <key> or save it permanently:")
    log.muted("  onboardai sync --api-key <your-key>")
    log.muted("")
    log.muted("Get your API key from: https://app.onboardai.dev/settings → API tab")
    console.log()
    return
  }

  // Save key for future use
  const config = await readConfig()
  if (config.apiKey !== apiKey) {
    await writeConfig({ ...config, apiKey })
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
    log.info("View your onboarding dashboard at: https://app.onboardai.dev/dashboard")
  } catch (err) {
    s2.fail("Sync failed")
    const message = err instanceof Error ? err.message : "Unknown error"
    log.error(`Error: ${message}`)
    log.muted("Check your API key and internet connection, then try again.")
  }

  console.log()
}
