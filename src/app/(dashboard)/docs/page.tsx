"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Terminal,
  Download,
  Play,
  Shield,
  Eye,
  FileJson,
  GitBranch,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Zap,
  BookOpen,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { staggerContainer, fadeInUp } from "@/lib/animations"

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="group relative rounded-xl border border-border bg-[hsl(var(--code-bg))] overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-foreground-muted">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {n}
    </div>
  )
}

function SectionHeading({ icon: Icon, title, id }: { icon: typeof Terminal; title: string; id: string }) {
  return (
    <div id={id} className="flex items-center gap-2.5 scroll-mt-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function CommandCard({
  command,
  description,
  flags,
}: {
  command: string
  description: string
  flags?: { flag: string; desc: string }[]
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <code className="text-sm font-semibold text-primary font-mono">{command}</code>
        <p className="mt-1 text-xs text-foreground-muted">{description}</p>
      </div>
      {flags && flags.length > 0 && (
        <div className="space-y-1.5 border-t border-border pt-3">
          {flags.map((f) => (
            <div key={f.flag} className="flex items-start gap-2">
              <code className="shrink-0 rounded bg-background-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {f.flag}
              </code>
              <span className="text-xs text-foreground-muted">{f.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const NAV_SECTIONS = [
  { id: "installation", label: "Installation" },
  { id: "first-scan", label: "Your first scan" },
  { id: "watch-mode", label: "Watch mode" },
  { id: "ci-integration", label: "CI integration" },
  { id: "json-output", label: "JSON output" },
  { id: "commands", label: "All commands" },
  { id: "dashboard", label: "Dashboard sync" },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation")

  function scrollTo(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="CLI Docs"
        subtitle="Get started with the OnboardAI security CLI in minutes"
        actions={
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://www.npmjs.com/package/onboardai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              npm page
            </a>
          </Button>
        }
      />

      <div className="flex gap-8 items-start">
        {/* Sticky sidebar nav */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-6 space-y-0.5">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              On this page
            </p>
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                  activeSection === s.id
                    ? "bg-primary-subtle font-medium text-primary"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {activeSection === s.id && <ChevronRight className="h-3 w-3 shrink-0" />}
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="min-w-0 flex-1 space-y-10"
        >
          {/* Hero callout */}
          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-primary/20 bg-primary-subtle p-5"
          >
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  OnboardAI CLI — code security monitoring
                </p>
                <p className="mt-1 text-xs text-foreground-muted leading-relaxed">
                  A zero-config CLI that scans your codebase for hardcoded secrets, unsafe code
                  patterns, and dependency vulnerabilities. Works locally and in CI. Syncs results
                  to your OnboardAI dashboard.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── 1. Installation ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Download} title="Installation" id="installation" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Install the CLI globally with npm or run it on demand with{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npx</code>.
              Node.js 18 or later is required.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <span className="text-sm font-medium text-foreground">Install globally</span>
              </div>
              <CodeBlock code="npm install -g onboardai" />

              <div className="flex items-center gap-2">
                <StepNumber n={2} />
                <span className="text-sm font-medium text-foreground">
                  Or run without installing
                </span>
              </div>
              <CodeBlock code="npx onboardai security" />

              <div className="flex items-center gap-2">
                <StepNumber n={3} />
                <span className="text-sm font-medium text-foreground">Verify installation</span>
              </div>
              <CodeBlock code="onboardai --version" />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground">Prerequisites</p>
              <ul className="mt-2 space-y-1">
                {["Node.js ≥ 18.0.0", "npm ≥ 8.0.0", "Git repository (for .gitignore checks)"].map(
                  (req) => (
                    <li key={req} className="flex items-center gap-2 text-xs text-foreground-muted">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
                      {req}
                    </li>
                  )
                )}
              </ul>
            </div>
          </motion.section>

          {/* ── 2. First scan ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Play} title="Your first scan" id="first-scan" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Navigate to your project root and run a full security audit. The scan checks for
              hardcoded secrets, unsafe code patterns, and env file exposure — no config needed.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <span className="text-sm font-medium text-foreground">
                  Navigate to your project
                </span>
              </div>
              <CodeBlock code="cd /path/to/your/project" />

              <div className="flex items-center gap-2">
                <StepNumber n={2} />
                <span className="text-sm font-medium text-foreground">Run the security audit</span>
              </div>
              <CodeBlock code="onboardai security" />

              <div className="flex items-center gap-2">
                <StepNumber n={3} />
                <span className="text-sm font-medium text-foreground">Read the output</span>
              </div>
              <div className="rounded-xl border border-border bg-[hsl(var(--code-bg))] p-4 font-mono text-xs leading-6 text-foreground">
                <p className="text-foreground-muted">🔒 OnboardAI — Security Audit</p>
                <p className="text-foreground-muted">─────────────────────────────────────────</p>
                <p className="mt-2 text-foreground-muted">── Dependency vulnerabilities ──</p>
                <p className="text-emerald-400">✓ No dependency vulnerabilities found</p>
                <p className="mt-2 text-foreground-muted">── Secret scanning ──</p>
                <p className="text-emerald-400">✓ No hardcoded secrets detected</p>
                <p className="mt-2 text-foreground-muted">── Code pattern analysis ──</p>
                <p className="text-yellow-400">⚠ eval() usage  src/utils/parse.ts:42</p>
                <p className="mt-2 text-foreground-muted">── Environment files ──</p>
                <p className="text-emerald-400">✓ .env files not tracked by git</p>
                <p className="mt-3 text-foreground-muted">  Security Score</p>
                <p className="text-foreground">  ████████████████████████░░░░  <span className="text-yellow-400 font-bold">84/100</span>  <span className="text-yellow-400">[GOOD]</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Never commit credentials.</strong> If the scanner finds secrets,
                  rotate them immediately — assume they are compromised if they were ever pushed
                  to a remote repository.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── 3. Watch mode ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Eye} title="Watch mode" id="watch-mode" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Watch mode monitors your source files in real time. Every time you save a{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">.ts</code>,{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">.tsx</code>,{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">.js</code>, or{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">.env</code>{" "}
              file the scan re-runs automatically — with a 500ms debounce to avoid flooding.
            </p>

            <CodeBlock code="onboardai security --watch" />

            <p className="text-sm text-foreground-muted">The terminal clears and shows an updated report on each change:</p>
            <div className="rounded-xl border border-border bg-[hsl(var(--code-bg))] p-4 font-mono text-xs leading-6 text-foreground">
              <p className="text-foreground-muted">🔒 OnboardAI — Security Monitor (watch mode)</p>
              <p className="text-foreground-muted">─────────────────────────────────────────────</p>
              <p className="text-foreground-muted">  Last scan: 14:23:07  ·  Ctrl+C to stop</p>
              <p className="mt-2 text-foreground-muted">── Secret scanning ──</p>
              <p className="text-red-400">✗ Hardcoded password  src/config/db.ts:18</p>
              <p className="mt-2 text-foreground-muted">  Security Score</p>
              <p className="text-foreground">  ████████░░░░░░░░░░░░░░░░░░░░  <span className="text-red-400 font-bold">60/100</span>  <span className="text-red-400">[NEEDS WORK]</span></p>
            </div>

            <p className="text-xs text-foreground-muted">
              Watched directories:{" "}
              {["src/", "app/", "lib/", "pages/", "api/"].map((d) => (
                <code
                  key={d}
                  className="mr-1 rounded bg-background-muted px-1 font-mono text-xs"
                >
                  {d}
                </code>
              ))}
              Falls back to project root if none exist. Press{" "}
              <kbd className="rounded border border-border px-1.5 py-0.5 text-xs">Ctrl+C</kbd> to stop.
            </p>
          </motion.section>

          {/* ── 4. CI integration ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={GitBranch} title="CI integration" id="ci-integration" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Add the{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">--quiet</code>{" "}
              flag to make the command exit with code{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">1</code> when
              critical or high severity issues are found. This blocks the pipeline until issues
              are resolved.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <span className="text-sm font-medium text-foreground">GitHub Actions</span>
              </div>
              <CodeBlock
                language="yaml"
                code={`# .github/workflows/security.yml
name: Security Audit

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx onboardai security --quiet`}
              />

              <div className="flex items-center gap-2">
                <StepNumber n={2} />
                <span className="text-sm font-medium text-foreground">Pre-commit git hook</span>
              </div>
              <CodeBlock
                language="bash"
                code={`# .git/hooks/pre-commit
#!/bin/sh
npx onboardai security --quiet
if [ $? -ne 0 ]; then
  echo "❌ Security issues found. Fix them before committing."
  exit 1
fi`}
              />
              <CodeBlock code="chmod +x .git/hooks/pre-commit" />

              <div className="flex items-center gap-2">
                <StepNumber n={3} />
                <span className="text-sm font-medium text-foreground">
                  Auto-install via <code className="text-sm font-mono">init</code>
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Running{" "}
                <code className="rounded bg-background-muted px-1 font-mono text-xs">
                  onboardai init
                </code>{" "}
                installs the pre-commit hook automatically.
              </p>
              <CodeBlock code="onboardai init" />
            </div>
          </motion.section>

          {/* ── 5. JSON output ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={FileJson} title="JSON output" id="json-output" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Pipe structured JSON output into other tools, dashboards, or scripts using the{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">
                --output json
              </code>{" "}
              flag. Works in both one-shot and watch modes.
            </p>

            <CodeBlock code="onboardai security --output json" />
            <CodeBlock code={`onboardai security --output json | jq '.findings[] | select(.severity == "critical")'`} />
            <CodeBlock code={`# In watch mode — streams JSON objects, one per scan
onboardai security --watch --output json`} />

            <p className="text-xs font-semibold text-foreground">Output shape</p>
            <CodeBlock
              language="json"
              code={`{
  "score": 84,
  "findings": [
    {
      "file": "src/utils/parse.ts",
      "line": 42,
      "issue": "eval() usage",
      "severity": "high",
      "category": "code-pattern"
    }
  ],
  "dependencies": {
    "vulnerabilities": 2,
    "critical": 0,
    "high": 1,
    "moderate": 1,
    "low": 0
  },
  "scannedAt": "2026-04-20T14:23:07.000Z"
}`}
            />
          </motion.section>

          {/* ── 6. All commands ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Terminal} title="All commands" id="commands" />
            <p className="text-sm text-foreground-muted">
              The full list of available CLI commands and their flags.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <CommandCard
                command="onboardai security"
                description="Run a full security audit on the current directory."
                flags={[
                  { flag: "--watch", desc: "Re-scan on file change (500ms debounce)" },
                  { flag: "--output json", desc: "Emit structured JSON to stdout" },
                  { flag: "--quiet", desc: "Exit code 1 on critical/high findings (CI mode)" },
                ]}
              />
              <CommandCard
                command="onboardai init"
                description="Interactive setup: validates Node/npm, writes .env.local, installs git hooks."
                flags={[{ flag: "--interactive", desc: "Force the interactive wizard" }]}
              />
              <CommandCard
                command="onboardai status"
                description="Show a full environment health check — Node version, env vars, dependencies."
              />
              <CommandCard
                command="onboardai fix"
                description="Auto-fix common environment issues."
                flags={[
                  { flag: "--vulnerabilities", desc: "Run npm audit fix" },
                  { flag: "--env", desc: "Validate and fill missing .env.local keys" },
                  { flag: "--ports", desc: "Free blocked ports 3000 and 5432" },
                  { flag: "--all", desc: "Run all available fixes" },
                ]}
              />
              <CommandCard
                command="onboardai sync"
                description="Sync local progress and security results to the OnboardAI dashboard."
                flags={[{ flag: "--api-key <key>", desc: "Override the stored API key" }]}
              />
              <CommandCard
                command="onboardai report"
                description="Generate an onboarding progress report."
                flags={[{ flag: "--send-to <email>", desc: "Email the report to someone" }]}
              />
              <CommandCard
                command="onboardai share"
                description="Generate a shareable Markdown context summary for your team."
                flags={[{ flag: "--context", desc: "Include full codebase context" }]}
              />
            </div>
          </motion.section>

          {/* ── 7. Dashboard sync ── */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Zap} title="Dashboard sync" id="dashboard" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              After running a scan, sync the results to your OnboardAI dashboard so your team can
              see the security posture of every connected repo — without leaving the browser.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <span className="text-sm font-medium text-foreground">Get your API key</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Go to{" "}
                <strong>Settings → API</strong> in the dashboard and copy your API key.
              </p>

              <div className="flex items-center gap-2">
                <StepNumber n={2} />
                <span className="text-sm font-medium text-foreground">Sync once</span>
              </div>
              <CodeBlock code="onboardai sync --api-key YOUR_API_KEY" />

              <div className="flex items-center gap-2">
                <StepNumber n={3} />
                <span className="text-sm font-medium text-foreground">
                  Or store the key permanently
                </span>
              </div>
              <CodeBlock
                code={`# The key is saved to ~/.onboardai/config.json after the first sync
onboardai sync --api-key YOUR_API_KEY
# Subsequent syncs just need:
onboardai sync`}
              />

              <div className="flex items-center gap-2">
                <StepNumber n={4} />
                <span className="text-sm font-medium text-foreground">
                  Combine scan + sync in one step
                </span>
              </div>
              <CodeBlock code="onboardai security --output json | onboardai sync" />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">
                  View results in the Security tab
                </p>
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                After syncing, open the{" "}
                <strong>Security</strong> page in the dashboard to see your score, all findings
                grouped by severity, and a history of past scans — all in one place.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => (window.location.href = "/security")}
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Go to Security
              </Button>
            </div>
          </motion.section>

          {/* What gets scanned */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <SectionHeading icon={Shield} title="What gets scanned" id="what-gets-scanned" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Hardcoded secrets",
                  items: [
                    "AWS Access / Secret Keys",
                    "GitHub tokens (ghp_*)",
                    "OpenAI keys (sk-*)",
                    "Stripe live keys",
                    "JWT secrets",
                    "Database URLs with credentials",
                    "Generic API secrets",
                    "Private key blocks",
                  ],
                  severity: "critical" as const,
                },
                {
                  label: "Unsafe code patterns",
                  items: [
                    "eval() usage",
                    "innerHTML assignment",
                    "dangerouslySetInnerHTML",
                    "SQL string concatenation",
                    "Command injection risk",
                    "Insecure random for tokens",
                    "Prototype pollution (__proto__)",
                    "Unsafe JSON.parse on user input",
                  ],
                  severity: "high" as const,
                },
              ].map((group) => (
                <div key={group.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{group.label}</p>
                    <Badge
                      variant="outline"
                      className={
                        group.severity === "critical"
                          ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                          : "border-orange-300 text-orange-600 dark:border-orange-800 dark:text-orange-400"
                      }
                    >
                      {group.severity}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-foreground-muted">
                        <div className="h-1 w-1 shrink-0 rounded-full bg-foreground-subtle" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-muted">
              Scanned file types:{" "}
              {[".ts", ".tsx", ".js", ".jsx", ".env", ".json"].map((ext) => (
                <code key={ext} className="mr-1 rounded bg-background-muted px-1 font-mono text-xs">
                  {ext}
                </code>
              ))}
              Ignored:{" "}
              {["node_modules/", ".next/", "dist/", "build/", "coverage/"].map((d) => (
                <code key={d} className="mr-1 rounded bg-background-muted px-1 font-mono text-xs">
                  {d}
                </code>
              ))}
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}
