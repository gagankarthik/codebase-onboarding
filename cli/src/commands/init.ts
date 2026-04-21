import inquirer from "inquirer"
import { execa } from "execa"
import * as path from "path"
import * as fs from "fs-extra"
import chalk from "chalk"
import { log, spinner, badge, section } from "../utils/terminal"
import { getSystemInfo, getDependencyStatus, runNpmAudit } from "../utils/system"
import { copyEnvExample, validateEnvStructure } from "../utils/env"

interface InitOptions {
  interactive?: boolean
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(chalk.bold("  ✦ OnboardAI — Environment Setup"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log()

  // 1. System checks
  section("System checks")
  const s1 = spinner("Checking Node.js and npm...").start()
  const sys = await getSystemInfo()
  s1.stop()

  if (!sys.nodeOk) {
    log.error(`Node.js v${sys.nodeVersion} detected — v18+ required.`)
    log.muted("Install Node.js from https://nodejs.org")
    process.exit(1)
  }

  log.success(`Node.js v${sys.nodeVersion}  ${badge("OK", "success")}`)
  log.success(`npm v${sys.npmVersion}  ${badge("OK", "success")}`)

  if (!sys.gitAvailable) {
    log.warn("Git not found — some features may not work.")
  } else {
    log.success(`Git available  ${badge("OK", "success")}`)
  }

  // 2. Interactive wizard
  if (options.interactive) {
    await runInteractiveWizard(cwd)
  }

  // 3. Dependencies
  section("Dependencies")
  const { packageJsonExists, nodeModulesExists } = await getDependencyStatus(cwd)

  if (!packageJsonExists) {
    log.error("No package.json found. Make sure you're in the right directory.")
    process.exit(1)
  }

  if (!nodeModulesExists) {
    const s2 = spinner("Installing dependencies...").start()
    try {
      await execa("npm", ["install"], { cwd })
      s2.succeed("Dependencies installed")
    } catch {
      s2.fail("Dependency installation failed — run `npm install` manually.")
      process.exit(1)
    }
  } else {
    log.success("Dependencies already installed")
  }

  // 4. Environment variables
  section("Environment variables")
  const envCopied = await copyEnvExample(cwd)
  if (envCopied) {
    log.success(".env.local created from .env.example")
    log.warn("Fill in the required values in .env.local before starting.")
  }

  const { missing, empty, configured, total } = await validateEnvStructure(cwd)
  if (total > 0) {
    log.info(`${configured}/${total} variables configured`)
    if (missing.length > 0) {
      log.warn(`Missing keys: ${missing.map((k) => chalk.yellow(k)).join(", ")}`)
    }
    if (empty.length > 0) {
      log.warn(`Empty keys: ${empty.map((k) => chalk.yellow(k)).join(", ")}`)
    }
  }

  // 5. Git hooks
  section("Git hooks")
  const hooksInstalled = await setupGitHooks(cwd)
  if (hooksInstalled) {
    log.success("Pre-commit security hook installed")
  } else {
    log.muted("Skipped (not a git repo)")
  }

  // 6. Security scan
  section("Security scan")
  const s3 = spinner("Running npm audit...").start()
  const audit = await runNpmAudit(cwd)
  s3.stop()

  if (audit.vulnerabilities === 0) {
    log.success(`No vulnerabilities found  ${badge("CLEAN", "success")}`)
  } else {
    log.warn(
      `${audit.vulnerabilities} vulnerabilit${audit.vulnerabilities === 1 ? "y" : "ies"} found ` +
        `(${audit.critical} critical, ${audit.high} high, ${audit.moderate} moderate, ${audit.low} low)`
    )
    log.muted("Run `onboardai fix --vulnerabilities` to auto-fix.")
  }

  // 7. Summary
  console.log()
  console.log(chalk.bold.green("  ✓ Setup complete!"))
  console.log()
  console.log(chalk.gray("  Next steps:"))
  if (missing.length > 0 || empty.length > 0) {
    console.log(chalk.gray("    1. Fill in .env.local with your credentials"))
    console.log(chalk.gray("    2. Run `npm run dev` to start the development server"))
    console.log(chalk.gray("    3. Run `onboardai status` to verify everything is ready"))
  } else {
    console.log(chalk.gray("    1. Run `npm run dev` to start the development server"))
    console.log(chalk.gray("    2. Open http://localhost:3000 in your browser"))
    console.log(chalk.gray("    3. Run `onboardai status` anytime to check your environment"))
  }
  console.log()
}

async function runInteractiveWizard(cwd: string): Promise<void> {
  section("Interactive setup")

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "role",
      message: "What is your role?",
      choices: [
        "Frontend Engineer",
        "Backend Engineer",
        "Full Stack Engineer",
        "DevOps Engineer",
        "Data Engineer",
        "Mobile Engineer",
      ],
    },
    {
      type: "input",
      name: "team",
      message: "Which team are you joining?",
      validate: (v: string) => v.trim().length > 0 || "Team name is required",
    },
    {
      type: "input",
      name: "name",
      message: "Your full name?",
      validate: (v: string) => v.trim().length > 0 || "Name is required",
    },
    {
      type: "confirm",
      name: "installHooks",
      message: "Install git pre-commit hooks for security scanning?",
      default: true,
    },
    {
      type: "confirm",
      name: "setupEditor",
      message: "Generate VS Code workspace settings?",
      default: true,
    },
  ])

  if (answers.setupEditor) {
    await setupVscodeSettings(cwd, answers.role as string)
    log.success("VS Code workspace settings configured")
  }

  // Save role/name to local config
  const configPath = path.join(cwd, ".onboardai.json")
  await fs.writeJson(
    configPath,
    { role: answers.role, team: answers.team, name: answers.name, setupAt: new Date().toISOString() },
    { spaces: 2 }
  )
  log.success(`Saved onboarding profile to .onboardai.json`)
}

async function setupGitHooks(cwd: string): Promise<boolean> {
  const gitDir = path.join(cwd, ".git")
  if (!(await fs.pathExists(gitDir))) return false

  const hooksDir = path.join(gitDir, "hooks")
  await fs.ensureDir(hooksDir)

  const preCommitPath = path.join(hooksDir, "pre-commit")
  const hookScript = `#!/bin/sh
# OnboardAI security pre-commit hook
if command -v onboardai >/dev/null 2>&1; then
  onboardai security --scan --quiet
fi
`
  await fs.writeFile(preCommitPath, hookScript, { mode: 0o755 })
  return true
}

async function setupVscodeSettings(cwd: string, role: string): Promise<void> {
  const vscodeDir = path.join(cwd, ".vscode")
  await fs.ensureDir(vscodeDir)

  const isFrontend = role.toLowerCase().includes("frontend") || role.toLowerCase().includes("full")
  const isBackend = role.toLowerCase().includes("backend") || role.toLowerCase().includes("full")

  const settings: Record<string, unknown> = {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "typescript.preferences.importModuleSpecifier": "relative",
    "files.exclude": { "node_modules": true, ".next": true, "dist": true },
  }

  if (isFrontend) {
    settings["tailwindCSS.experimental.classRegex"] = [["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]]
  }

  if (isBackend) {
    settings["typescript.preferences.includePackageJsonAutoImports"] = "on"
  }

  const settingsPath = path.join(vscodeDir, "settings.json")
  const existing = (await fs.pathExists(settingsPath)) ? await fs.readJson(settingsPath) : {}
  await fs.writeJson(settingsPath, { ...existing, ...settings }, { spaces: 2 })
}
