import type { SecurityFinding, DependencyVulnerabilities, SecurityScan } from "@/types"
import { generateId } from "@/lib/utils"

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
  { name: "Command injection risk (exec with template literal)", pattern: /exec\s*\(`[^`]*\$\{/, severity: "high" },
  { name: "document.write usage", pattern: /document\.write\s*\(/, severity: "medium" },
  { name: "Insecure random (Math.random for tokens)", pattern: /Math\.random\(\).*token|token.*Math\.random\(\)/i, severity: "high" },
  { name: "Prototype pollution risk (__proto__)", pattern: /__proto__/, severity: "high" },
  { name: "Unsafe deserialization", pattern: /JSON\.parse\s*\(\s*req\.(body|query|params)/, severity: "medium" },
  { name: "Hard-coded localhost URL", pattern: /['"`]https?:\/\/localhost(:\d+)?['"`]/, severity: "low" },
  { name: "TODO security comment", pattern: /\/\/.*(fixme|hack|security|vuln|todo).*auth/i, severity: "low" },
]

export interface FileInput {
  path: string
  content: string
}

export interface ScanResult {
  findings: SecurityFinding[]
  score: number
}

export function scanFiles(files: FileInput[]): ScanResult {
  const findings: SecurityFinding[] = []

  for (const { path: filePath, content } of files) {
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({ file: filePath, line: i + 1, issue: name, severity: "critical", category: "secret" })
        }
      }

      for (const { name, pattern, severity } of CODE_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({ file: filePath, line: i + 1, issue: name, severity, category: "code-pattern" })
        }
      }
    }
  }

  const score = computeScore(findings, { critical: 0, high: 0, moderate: 0, low: 0, total: 0 })
  return { findings, score }
}

export function computeScore(
  findings: SecurityFinding[],
  deps: DependencyVulnerabilities
): number {
  let score = 100
  score -= deps.critical * 15
  score -= deps.high * 8
  score -= deps.moderate * 3
  score -= deps.low * 1

  for (const f of findings) {
    if (f.severity === "critical") score -= 20
    else if (f.severity === "high") score -= 8
    else if (f.severity === "medium") score -= 4
    else score -= 1
  }

  return Math.max(0, Math.min(100, score))
}

export function buildScan(
  repoId: string,
  findings: SecurityFinding[],
  deps: DependencyVulnerabilities
): SecurityScan {
  return {
    scanId: generateId(),
    repoId,
    score: computeScore(findings, deps),
    findings,
    dependencyVulnerabilities: deps,
    scannedAt: new Date().toISOString(),
  }
}
