import chalk from "chalk"
import { log, badge, table, section } from "../utils/terminal"
import {
  getSystemInfo,
  getDependencyStatus,
  runNpmAudit,
  isPortInUse,
  getGitCommitCount,
  getProjectName,
} from "../utils/system"
import { validateEnvStructure } from "../utils/env"

export async function statusCommand(): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(chalk.bold("  🔍 OnboardAI — Environment Health Check"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  const [sys, deps, audit, envStatus, port3000, port5432, gitCommits, projectName] =
    await Promise.all([
      getSystemInfo(),
      getDependencyStatus(cwd),
      runNpmAudit(cwd),
      validateEnvStructure(cwd),
      isPortInUse(3000),
      isPortInUse(5432),
      getGitCommitCount(cwd),
      getProjectName(cwd),
    ])

  section("Project")
  table([
    ["Project", chalk.bold(projectName)],
    ["Directory", chalk.gray(cwd)],
    ["Git commits", gitCommits > 0 ? chalk.green(gitCommits.toString()) : chalk.gray("0")],
    ["Git repo", sys.isGitRepo ? badge("YES", "success") : badge("NO", "neutral")],
  ])

  section("Runtime")
  table([
    [
      "Node.js",
      sys.nodeOk
        ? chalk.green(`v${sys.nodeVersion}`) + "  " + badge("OK", "success")
        : chalk.red(`v${sys.nodeVersion}`) + "  " + badge("UPDATE REQUIRED", "error"),
    ],
    [
      "npm",
      sys.npmOk
        ? chalk.green(`v${sys.npmVersion}`) + "  " + badge("OK", "success")
        : chalk.red(`v${sys.npmVersion}`) + "  " + badge("UPDATE REQUIRED", "error"),
    ],
    ["Git", sys.gitAvailable ? badge("Available", "success") : badge("Not found", "warn")],
  ])

  section("Dependencies")
  table([
    [
      "package.json",
      deps.packageJsonExists ? badge("Found", "success") : badge("Missing", "error"),
    ],
    [
      "node_modules",
      deps.nodeModulesExists ? badge("Installed", "success") : badge("Missing — run npm install", "error"),
    ],
    [
      "Vulnerabilities",
      audit.vulnerabilities === 0
        ? badge("None", "success")
        : audit.critical > 0 || audit.high > 0
        ? chalk.red(audit.vulnerabilities + " found") + "  " + badge("ACTION REQUIRED", "error")
        : chalk.yellow(audit.vulnerabilities + " found") + "  " + badge("REVIEW", "warn"),
    ],
  ])

  section("Environment")
  if (envStatus.total === 0) {
    table([["Variables", chalk.gray("No .env.example found")]])
  } else {
    table([
      [
        "Configured",
        envStatus.configured === envStatus.total
          ? chalk.green(`${envStatus.configured}/${envStatus.total}`) + "  " + badge("Complete", "success")
          : chalk.yellow(`${envStatus.configured}/${envStatus.total}`) + "  " + badge("Incomplete", "warn"),
      ],
      [
        "Missing keys",
        envStatus.missing.length === 0
          ? badge("None", "success")
          : chalk.yellow(envStatus.missing.join(", ")),
      ],
      [
        "Empty keys",
        envStatus.empty.length === 0
          ? badge("None", "success")
          : chalk.gray(envStatus.empty.join(", ")),
      ],
    ])
  }

  section("Ports")
  table([
    [
      "Port 3000 (Next.js)",
      port3000
        ? chalk.yellow("In use") + "  " + chalk.gray("(server may already be running)")
        : chalk.green("Available"),
    ],
    [
      "Port 5432 (PostgreSQL)",
      port5432 ? chalk.yellow("In use") : chalk.green("Available"),
    ],
  ])

  // Summary
  console.log()
  const issues: string[] = []
  if (!sys.nodeOk) issues.push("Node.js version too old")
  if (!deps.nodeModulesExists) issues.push("Dependencies not installed — run `npm install`")
  if (audit.critical > 0 || audit.high > 0) issues.push("Critical/high vulnerabilities — run `onboardai fix --vulnerabilities`")
  if (envStatus.missing.length > 0) issues.push(`Missing env keys: ${envStatus.missing.join(", ")}`)

  if (issues.length === 0) {
    console.log(chalk.bold.green("  ✓ All checks passed — environment is ready!"))
    console.log()
    console.log(chalk.gray("  Run `npm run dev` to start the development server."))
  } else {
    console.log(chalk.bold.yellow(`  ⚠ ${issues.length} issue${issues.length === 1 ? "" : "s"} found:`))
    issues.forEach((issue) => log.muted("• " + issue))
    console.log()
    console.log(chalk.gray("  Run `onboardai fix --all` to auto-fix where possible."))
  }
  console.log()
}
