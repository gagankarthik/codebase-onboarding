import * as fs from "fs-extra"
import * as path from "path"
import chalk from "chalk"
import { log, spinner, section, table } from "../utils/terminal"
import {
  getSystemInfo,
  getDependencyStatus,
  runNpmAudit,
  getGitCommitCount,
  getGitUserEmail,
  getProjectName,
} from "../utils/system"
import { validateEnvStructure } from "../utils/env"

interface ReportOptions {
  sendTo?: string
}

interface Report {
  generatedAt: string
  project: string
  engineer: { email: string }
  system: { nodeVersion: string; npmVersion: string }
  dependencies: { installed: boolean; vulnerabilities: number }
  environment: { configured: number; total: number; missing: string[] }
  git: { commitCount: number }
  onboardingProfile?: { role?: string; team?: string; name?: string }
  score: number
  recommendations: string[]
}

export async function reportCommand(options: ReportOptions): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(chalk.bold("  📊 OnboardAI — Onboarding Progress Report"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  const s = spinner("Gathering data...").start()

  const [sys, deps, audit, envStatus, gitCommits, gitEmail, projectName] = await Promise.all([
    getSystemInfo(),
    getDependencyStatus(cwd),
    runNpmAudit(cwd),
    validateEnvStructure(cwd),
    getGitCommitCount(cwd),
    getGitUserEmail(cwd),
    getProjectName(cwd),
  ])

  // Load onboarding profile if present
  const profilePath = path.join(cwd, ".onboardai.json")
  let profile: { role?: string; team?: string; name?: string } = {}
  if (await fs.pathExists(profilePath)) {
    profile = await fs.readJson(profilePath)
  }

  s.stop()

  // Compute score
  let score = 100
  if (!deps.nodeModulesExists) score -= 20
  if (audit.critical > 0) score -= 20
  if (audit.high > 0) score -= 10
  if (envStatus.missing.length > 0) score -= 15
  if (envStatus.empty.length > 0) score -= 5
  if (gitCommits === 0) score -= 10
  score = Math.max(0, score)

  const recommendations: string[] = []
  if (!deps.nodeModulesExists) recommendations.push("Run `npm install` to install dependencies")
  if (audit.vulnerabilities > 0) recommendations.push("Run `onboardai fix --vulnerabilities` to patch security issues")
  if (envStatus.missing.length > 0) recommendations.push(`Fill in missing env keys: ${envStatus.missing.join(", ")}`)
  if (gitCommits === 0) recommendations.push("Make your first commit to the repository")
  if (gitCommits < 5) recommendations.push("Complete the setup tasks in your onboarding guide")

  const report: Report = {
    generatedAt: new Date().toISOString(),
    project: projectName,
    engineer: { email: gitEmail },
    system: { nodeVersion: sys.nodeVersion, npmVersion: sys.npmVersion },
    dependencies: { installed: deps.nodeModulesExists, vulnerabilities: audit.vulnerabilities },
    environment: {
      configured: envStatus.configured,
      total: envStatus.total,
      missing: envStatus.missing,
    },
    git: { commitCount: gitCommits },
    onboardingProfile: profile,
    score,
    recommendations,
  }

  // Display report
  section("Summary")
  table([
    ["Project", chalk.bold(report.project)],
    ["Engineer", gitEmail || chalk.gray("unknown")],
    ["Role", profile.role || chalk.gray("not set — run `onboardai init -i`")],
    ["Team", profile.team || chalk.gray("not set")],
    ["Generated", new Date(report.generatedAt).toLocaleString()],
  ])

  section("Onboarding Progress")
  table([
    [
      "Dependencies",
      deps.nodeModulesExists ? chalk.green("Installed") : chalk.red("Not installed"),
    ],
    [
      "Env variables",
      `${envStatus.configured}/${envStatus.total} configured`,
    ],
    [
      "Vulnerabilities",
      audit.vulnerabilities === 0 ? chalk.green("None") : chalk.yellow(audit.vulnerabilities.toString()),
    ],
    [
      "Git commits",
      gitCommits.toString(),
    ],
    [
      "Onboarding score",
      `${score}/100`,
    ],
  ])

  if (recommendations.length > 0) {
    section("Recommended next steps")
    recommendations.forEach((r, i) => log.muted(`${i + 1}. ${r}`))
  }

  // Save JSON report
  const reportPath = path.join(cwd, "onboarding-report.json")
  await fs.writeJson(reportPath, report, { spaces: 2 })
  log.success(`\nReport saved to ${chalk.cyan("onboarding-report.json")}`)

  // Generate HTML report
  const htmlPath = path.join(cwd, "onboarding-report.html")
  await fs.writeFile(htmlPath, generateHtmlReport(report))
  log.success(`HTML report saved to ${chalk.cyan("onboarding-report.html")}`)

  if (options.sendTo) {
    log.info(`Email sending requires SMTP configuration (coming soon).`)
    log.muted(`Share ${htmlPath} with ${options.sendTo} manually for now.`)
  }

  console.log()
}

function generateHtmlReport(report: Report): string {
  const scoreColor = report.score >= 90 ? "#16a34a" : report.score >= 70 ? "#d97706" : "#dc2626"
  const rows = (pairs: [string, string][]) =>
    pairs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Onboarding Report — ${report.project}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #111; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
    .score { font-size: 64px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
    .score-label { font-size: 14px; color: #666; margin-top: 4px; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    h2 { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #374151; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    td:first-child { color: #6b7280; width: 200px; }
    ul { padding-left: 20px; margin: 0; }
    li { font-size: 14px; padding: 4px 0; color: #374151; }
    .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; text-align: center; }
  </style>
</head>
<body>
  <h1>Onboarding Report</h1>
  <p class="meta">Project: <strong>${report.project}</strong> · Generated ${new Date(report.generatedAt).toLocaleString()}</p>
  <div class="card" style="text-align:center;background:#f9fafb;">
    <div class="score">${report.score}</div>
    <div class="score-label">Onboarding Score / 100</div>
  </div>
  <div class="card">
    <h2>Engineer</h2>
    <table>
      ${rows([
        ["Email", report.engineer.email || "—"],
        ["Role", report.onboardingProfile?.role || "—"],
        ["Team", report.onboardingProfile?.team || "—"],
      ])}
    </table>
  </div>
  <div class="card">
    <h2>Environment</h2>
    <table>
      ${rows([
        ["Node.js", `v${report.system.nodeVersion}`],
        ["npm", `v${report.system.npmVersion}`],
        ["Dependencies", report.dependencies.installed ? "Installed" : "Not installed"],
        ["Vulnerabilities", report.dependencies.vulnerabilities.toString()],
        ["Env variables", `${report.environment.configured}/${report.environment.total} configured`],
        ["Git commits", report.git.commitCount.toString()],
      ])}
    </table>
  </div>
  ${
    report.recommendations.length > 0
      ? `<div class="card">
    <h2>Recommended next steps</h2>
    <ul>${report.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
  </div>`
      : ""
  }
  <p class="footer">Generated by OnboardAI CLI · onboardai.dev</p>
</body>
</html>`
}
