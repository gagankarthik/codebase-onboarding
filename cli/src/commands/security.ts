import * as fs from "fs-extra"
import * as path from "path"
import * as nodefs from "fs"
import chalk from "chalk"
import { log, spinner, badge, section, progressBar, scoreColor } from "../utils/terminal"
import { runNpmAudit } from "../utils/system"

interface SecurityOptions {
  scan?: boolean
  quiet?: boolean
  watch?: boolean
  output?: string
}

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "AWS Secret Key", pattern: /aws_secret_access_key\s*=\s*[^\s]+/i },
  { name: "GitHub token", pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: "Private key block", pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  { name: "Hardcoded password", pattern: /password\s*=\s*["'][^"']{8,}["']/i },
  { name: "OpenAI key", pattern: /sk-[a-zA-Z0-9]{48}/ },
  { name: "Stripe secret key", pattern: /sk_live_[a-zA-Z0-9]+/ },
  { name: "Generic API secret", pattern: /api[_-]?secret\s*[=:]\s*["'][^"']{16,}["']/i },
  { name: "JWT secret", pattern: /jwt[_-]?secret\s*[=:]\s*["'][^"']{16,}["']/i },
  { name: "Database URL with credentials", pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@/ },
]

const CODE_PATTERNS: Array<{ name: string; pattern: RegExp; severity: "high" | "medium" | "low" }> = [
  { name: "eval() usage", pattern: /\beval\s*\(/, severity: "high" },
  { name: "innerHTML assignment", pattern: /\.innerHTML\s*=/, severity: "medium" },
  { name: "dangerouslySetInnerHTML", pattern: /dangerouslySetInnerHTML/, severity: "medium" },
  { name: "SQL string concatenation", pattern: /query\s*\+\s*["`']|`SELECT.*\$\{/i, severity: "high" },
  { name: "Unsafe regex (ReDoS risk)", pattern: /\(\.\*\)\+|\(\.\+\)\*/, severity: "medium" },
  { name: "Command injection risk", pattern: /exec\s*\(`[^`]*\$\{/, severity: "high" },
  { name: "document.write usage", pattern: /document\.write\s*\(/, severity: "medium" },
  { name: "Insecure random for tokens", pattern: /Math\.random\(\).*token|token.*Math\.random\(\)/i, severity: "high" },
  { name: "Prototype pollution (__proto__)", pattern: /__proto__/, severity: "high" },
  { name: "Unsafe deserialization", pattern: /JSON\.parse\s*\(\s*req\.(body|query|params)/, severity: "medium" },
  { name: "Hard-coded localhost URL", pattern: /['"`]https?:\/\/localhost(:\d+)?['"`]/, severity: "low" },
]

interface Finding {
  file: string
  line: number
  issue: string
  severity: "critical" | "high" | "medium" | "low"
  category: "secret" | "code-pattern" | "dependency" | "env"
}

interface ScanReport {
  score: number
  findings: Finding[]
  dependencies: {
    vulnerabilities: number
    critical: number
    high: number
    moderate: number
    low: number
  }
  scannedAt: string
}

async function runScan(cwd: string): Promise<ScanReport> {
  const findings: Finding[] = []
  let score = 100

  const audit = await runNpmAudit(cwd)
  if (audit.vulnerabilities > 0) {
    score -= audit.critical * 15 + audit.high * 8 + audit.moderate * 3 + audit.low * 1
  }

  const secretFindings = await scanForSecrets(cwd)
  secretFindings.forEach((f) => {
    findings.push(f)
    score -= 20
  })

  const codeFindings = await scanCodePatterns(cwd)
  codeFindings.forEach((f) => {
    findings.push(f)
    if (f.severity === "high") score -= 8
    else if (f.severity === "medium") score -= 4
    else score -= 1
  })

  const envIssues = await checkEnvFiles(cwd)
  envIssues.forEach(() => { score -= 10 })

  for (const issue of envIssues) {
    findings.push({ file: ".gitignore", line: 0, issue, severity: "high", category: "env" })
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    findings,
    dependencies: {
      vulnerabilities: audit.vulnerabilities,
      critical: audit.critical,
      high: audit.high,
      moderate: audit.moderate,
      low: audit.low,
    },
    scannedAt: new Date().toISOString(),
  }
}

function printReport(report: ScanReport): void {
  const { findings, score, dependencies } = report

  const secrets = findings.filter((f) => f.category === "secret")
  const codeIssues = findings.filter((f) => f.category === "code-pattern")
  const envIssues = findings.filter((f) => f.category === "env")

  section("Dependency vulnerabilities")
  if (dependencies.vulnerabilities === 0) {
    log.success("No dependency vulnerabilities found")
  } else {
    log.warn(`Found ${dependencies.vulnerabilities} vulnerabilities:`)
    if (dependencies.critical > 0) log.muted(`  ${chalk.red(dependencies.critical + " critical")}`)
    if (dependencies.high > 0) log.muted(`  ${chalk.yellow(dependencies.high + " high")}`)
    if (dependencies.moderate > 0) log.muted(`  ${dependencies.moderate + " moderate"}`)
    if (dependencies.low > 0) log.muted(`  ${chalk.gray(dependencies.low + " low")}`)
  }

  section("Secret scanning")
  if (secrets.length === 0) {
    log.success("No hardcoded secrets detected")
  } else {
    secrets.forEach((f) => log.error(`${f.issue}  ${chalk.gray(f.file + ":" + f.line)}`))
  }

  section("Code pattern analysis")
  if (codeIssues.length === 0) {
    log.success("No unsafe patterns detected")
  } else {
    codeIssues.forEach((f) => {
      const icon = f.severity === "high" ? chalk.red("✗") : chalk.yellow("⚠")
      log.muted(`${icon} ${f.issue}  ${chalk.gray(f.file + ":" + f.line)}`)
    })
  }

  section("Environment files")
  if (envIssues.length === 0) {
    log.success(".env files not tracked by git")
  } else {
    envIssues.forEach((f) => log.error(f.issue))
  }

  const clr = scoreColor(score)
  console.log()
  console.log(chalk.bold("  Security Score"))
  console.log(chalk.gray("  ────────────────────────────────────"))
  console.log("  " + progressBar(score))
  console.log()
  console.log(
    "  " +
      clr(chalk.bold(`${score}/100`)) +
      "  " +
      badge(
        score >= 90 ? "EXCELLENT" : score >= 70 ? "GOOD" : score >= 50 ? "FAIR" : "NEEDS WORK",
        score >= 90 ? "success" : score >= 70 ? "info" : score >= 50 ? "warn" : "error"
      )
  )

  if (findings.length > 0) {
    console.log()
    log.info(`Run ${chalk.cyan("onboardai fix --vulnerabilities")} to auto-fix dependency issues.`)
    log.info("Review secret findings manually — never commit credentials.")
  }

  console.log()
}

export async function securityCommand(options: SecurityOptions): Promise<void> {
  const cwd = process.cwd()
  const jsonMode = options.output === "json"

  if (options.watch) {
    if (!jsonMode) {
      console.log()
      console.log(chalk.bold("  🔒 OnboardAI — Security Monitor (watch mode)"))
      console.log(chalk.gray("  ─────────────────────────────────────────────"))
      console.log(chalk.gray("  Watching for file changes. Press Ctrl+C to stop.\n"))
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const runAndPrint = async () => {
      if (!jsonMode) {
        process.stdout.write("\x1Bc")
        console.log()
        console.log(chalk.bold("  🔒 OnboardAI — Security Monitor (watch mode)"))
        console.log(chalk.gray("  ─────────────────────────────────────────────"))
        console.log(chalk.gray(`  Last scan: ${new Date().toLocaleTimeString()}  ·  Ctrl+C to stop\n`))
      }

      const report = await runScan(cwd)

      if (jsonMode) {
        process.stdout.write(JSON.stringify(report) + "\n")
      } else {
        printReport(report)
      }
    }

    await runAndPrint()

    const watchDirs = ["src", "app", "lib", "pages", "api"].map((d) => path.join(cwd, d)).filter((d) => fs.pathExistsSync(d))
    if (watchDirs.length === 0) watchDirs.push(cwd)

    for (const dir of watchDirs) {
      nodefs.watch(dir, { recursive: true }, (_event, filename) => {
        if (!filename) return
        const ext = path.extname(filename)
        if (![".ts", ".tsx", ".js", ".jsx", ".env"].includes(ext)) return

        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          runAndPrint().catch(() => {})
        }, 500)
      })
    }

    await new Promise<void>(() => {})
    return
  }

  if (!jsonMode && !options.quiet) {
    console.log()
    console.log(chalk.bold("  🔒 OnboardAI — Security Audit"))
    console.log(chalk.gray("  ─────────────────────────────────────────"))
    console.log()
  }

  const s = spinner("Running security scan...").start()
  const report = await runScan(cwd)
  s.stop()

  if (jsonMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n")
    return
  }

  printReport(report)

  if (options.quiet && report.findings.some((f) => f.severity === "critical" || f.severity === "high")) {
    process.exit(1)
  }
}

async function scanForSecrets(cwd: string): Promise<Finding[]> {
  const findings: Finding[] = []
  const files = await getSourceFiles(cwd)

  for (const file of files) {
    const content = await fs.readFile(file, "utf8").catch(() => "")
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(lines[i])) {
          findings.push({
            file: path.relative(cwd, file),
            line: i + 1,
            issue: name,
            severity: "critical",
            category: "secret",
          })
        }
      }
    }
  }

  return findings
}

async function scanCodePatterns(cwd: string): Promise<Finding[]> {
  const findings: Finding[] = []
  const files = await getSourceFiles(cwd, [".ts", ".tsx", ".js", ".jsx"])

  for (const file of files) {
    const content = await fs.readFile(file, "utf8").catch(() => "")
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      for (const { name, pattern, severity } of CODE_PATTERNS) {
        if (pattern.test(lines[i])) {
          findings.push({
            file: path.relative(cwd, file),
            line: i + 1,
            issue: name,
            severity,
            category: "code-pattern",
          })
        }
      }
    }
  }

  return findings
}

async function checkEnvFiles(cwd: string): Promise<string[]> {
  const issues: string[] = []
  const gitignorePath = path.join(cwd, ".gitignore")

  if (!(await fs.pathExists(gitignorePath))) {
    issues.push("No .gitignore found — ensure .env.local is never committed")
    return issues
  }

  const gitignore = await fs.readFile(gitignorePath, "utf8")
  const envFiles = [".env.local", ".env", ".env.development.local", ".env.production.local"]

  for (const envFile of envFiles) {
    if (await fs.pathExists(path.join(cwd, envFile))) {
      if (!gitignore.includes(envFile) && !gitignore.includes(".env*")) {
        issues.push(`${envFile} exists but is not in .gitignore — risk of credential exposure`)
      }
    }
  }

  return issues
}

async function getSourceFiles(cwd: string, extensions?: string[]): Promise<string[]> {
  const exts = extensions ?? [".ts", ".tsx", ".js", ".jsx", ".env", ".json"]
  const ignored = new Set(["node_modules", ".next", "dist", "build", ".git", "coverage"])

  async function walk(dir: string): Promise<string[]> {
    const results: string[] = []
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...(await walk(full)))
      } else if (exts.some((ext) => entry.name.endsWith(ext))) {
        results.push(full)
      }
    }
    return results
  }

  return walk(cwd)
}
