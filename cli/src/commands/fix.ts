import execa from "execa"
import inquirer from "inquirer"
import * as path from "path"
import * as fs from "fs-extra"
import chalk from "chalk"
import { log, spinner, section } from "../utils/terminal"
import { runNpmAudit, isPortInUse, killPort } from "../utils/system"
import { validateEnvStructure, loadEnvFile, writeEnvFile } from "../utils/env"

interface FixOptions {
  vulnerabilities?: boolean
  env?: boolean
  ports?: boolean
  all?: boolean
}

export async function fixCommand(options: FixOptions): Promise<void> {
  const cwd = process.cwd()
  const runAll = options.all

  console.log()
  console.log(chalk.bold("  🔧 OnboardAI — Auto-Fix"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  if (!options.vulnerabilities && !options.env && !options.ports && !runAll) {
    log.info("No fix target specified. Available options:")
    log.muted("  --vulnerabilities   Fix npm audit vulnerabilities")
    log.muted("  --env               Validate and complete .env.local")
    log.muted("  --ports             Free blocked ports 3000 and 5432")
    log.muted("  --all               Run all fixes")
    console.log()
    return
  }

  if (options.vulnerabilities || runAll) {
    await fixVulnerabilities(cwd)
  }

  if (options.env || runAll) {
    await fixEnv(cwd)
  }

  if (options.ports || runAll) {
    await fixPorts()
  }

  console.log()
  log.success("Fix run complete.")
  console.log()
}

async function fixVulnerabilities(cwd: string): Promise<void> {
  section("Fixing vulnerabilities")

  const before = await runNpmAudit(cwd)
  if (before.vulnerabilities === 0) {
    log.success("No vulnerabilities to fix")
    return
  }

  log.info(`Found ${before.vulnerabilities} vulnerabilities — attempting auto-fix...`)

  const s = spinner("Running npm audit fix...").start()
  try {
    await execa("npm", ["audit", "fix"], { cwd })
    s.stop()
  } catch {
    s.stop()
    log.warn("npm audit fix completed with warnings")
  }

  const after = await runNpmAudit(cwd)
  const fixed = before.vulnerabilities - after.vulnerabilities

  if (fixed > 0) {
    log.success(`Fixed ${fixed} vulnerabilit${fixed === 1 ? "y" : "ies"}`)
  }
  if (after.vulnerabilities > 0) {
    log.warn(
      `${after.vulnerabilities} vulnerabilit${after.vulnerabilities === 1 ? "y" : "ies"} remain (may require breaking changes)`
    )
    log.muted("Run `npm audit fix --force` to force updates (may introduce breaking changes).")
  }
}

async function fixEnv(cwd: string): Promise<void> {
  section("Fixing environment variables")

  const { missing, empty, total } = await validateEnvStructure(cwd)

  if (total === 0) {
    log.info("No .env.example found — skipping")
    return
  }

  const localPath = path.join(cwd, ".env.local")
  const envEntries = await loadEnvFile(localPath)
  const existingKeys = new Set(envEntries.map((e) => e.key))

  const exampleEntries = await loadEnvFile(path.join(cwd, ".env.example"))
  let added = 0

  for (const entry of exampleEntries) {
    if (!entry.key || existingKeys.has(entry.key)) continue
    envEntries.push({ key: entry.key, value: "", comment: entry.comment })
    added++
  }

  if (added > 0) {
    await writeEnvFile(localPath, envEntries)
    log.success(`Added ${added} missing key${added === 1 ? "" : "s"} to .env.local (values are empty)`)
    log.warn("Fill in the empty values in .env.local before running the app.")
  } else {
    log.success("All keys from .env.example are present in .env.local")
  }

  if (empty.length > 0) {
    log.warn(`${empty.length} key${empty.length === 1 ? "" : "s"} still have empty values:`)
    empty.forEach((k) => log.muted(`  ${chalk.yellow(k)}`))

    const { editNow } = await inquirer.prompt([
      {
        type: "confirm",
        name: "editNow",
        message: "Open .env.local in your editor to fill in values?",
        default: false,
      },
    ])

    if (editNow) {
      const editor = process.env.EDITOR || process.env.VISUAL || "code"
      try {
        await execa(editor, [localPath], { stdio: "inherit" })
      } catch {
        log.error(`Could not open editor '${editor}'. Edit .env.local manually.`)
      }
    }
  }
}

async function fixPorts(): Promise<void> {
  section("Freeing blocked ports")

  const ports = [
    { port: 3000, name: "Next.js dev server" },
    { port: 5432, name: "PostgreSQL" },
  ]

  for (const { port, name } of ports) {
    const inUse = await isPortInUse(port)
    if (!inUse) {
      log.success(`Port ${port} (${name}) — already free`)
      continue
    }

    const { shouldKill } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldKill",
        message: `Port ${port} (${name}) is in use. Kill the process?`,
        default: true,
      },
    ])

    if (!shouldKill) {
      log.muted(`Skipped port ${port}`)
      continue
    }

    const s = spinner(`Freeing port ${port}...`).start()
    const killed = await killPort(port)
    s.stop()

    if (killed) {
      log.success(`Freed port ${port} (${name})`)
    } else {
      log.error(`Could not free port ${port} — kill the process manually.`)
    }
  }
}
