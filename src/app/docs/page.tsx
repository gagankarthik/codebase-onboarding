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
  Package,
  Upload,
  Link2,
  Wrench,
  Tag,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── helpers ──────────────────────────────────────────────────────────────────

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

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  id,
  badge,
}: {
  icon: typeof Terminal
  title: string
  id: string
  badge?: string
}) {
  return (
    <div id={id} className="flex items-center gap-2.5 scroll-mt-8">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {badge && (
        <Badge variant="secondary" className="text-xs">
          {badge}
        </Badge>
      )}
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

// ── nav ───────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "installation", label: "Installation" },
  { id: "first-scan", label: "Your first scan" },
  { id: "watch-mode", label: "Watch mode" },
  { id: "ci-integration", label: "CI integration" },
  { id: "json-output", label: "JSON output" },
  { id: "commands", label: "All commands" },
  { id: "dashboard-sync", label: "Dashboard sync" },
  { id: "publish-npm", label: "Publish to npm" },
  { id: "local-dev", label: "Local development" },
  { id: "what-is-scanned", label: "What is scanned" },
]

// ── page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation")

  function scrollTo(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10 space-y-2"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            CLI Documentation
          </h1>
        </div>
        <p className="text-sm text-foreground-muted">
          Everything you need to install, run, publish, and integrate the OnboardAI security CLI.
        </p>
      </motion.div>

      <div className="flex gap-10 items-start">
        {/* Sticky sidebar */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-24 space-y-0.5">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Contents
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

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="min-w-0 flex-1 space-y-12"
        >
          {/* Hero callout */}
          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-primary/20 bg-primary-subtle p-5"
          >
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">OnboardAI CLI — security monitoring for developers</p>
                <p className="mt-1 text-xs text-foreground-muted leading-relaxed">
                  A zero-config CLI that scans your codebase for hardcoded secrets, unsafe code
                  patterns, and dependency vulnerabilities. Runs locally, in CI, and in watch mode.
                  Syncs results to the OnboardAI dashboard.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── 1. Installation ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Download} title="Installation" id="installation" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Install globally with npm or run on demand with{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npx</code>.
              Requires Node.js 18+.
            </p>
            <div className="space-y-3">
              <Step n={1} label="Install globally" />
              <CodeBlock code="npm install -g onboardai" />
              <Step n={2} label="Or use without installing" />
              <CodeBlock code="npx onboardai security" />
              <Step n={3} label="Verify" />
              <CodeBlock code="onboardai --version" />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground">Requirements</p>
              <ul className="mt-2 space-y-1">
                {["Node.js ≥ 18.0.0", "npm ≥ 8.0.0", "Git repo (for .gitignore checks)"].map((r) => (
                  <li key={r} className="flex items-center gap-2 text-xs text-foreground-muted">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* ── 2. First scan ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Play} title="Your first scan" id="first-scan" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Navigate to your project root and run a full security audit. No config file needed.
            </p>
            <div className="space-y-3">
              <Step n={1} label="Go to your project" />
              <CodeBlock code="cd /path/to/your-project" />
              <Step n={2} label="Run the audit" />
              <CodeBlock code="onboardai security" />
              <Step n={3} label="Read the output" />
              <div className="rounded-xl border border-border bg-[hsl(var(--code-bg))] p-4 font-mono text-xs leading-6">
                <p className="text-foreground-muted">🔒 OnboardAI — Security Audit</p>
                <p className="text-foreground-muted">─────────────────────────────────────────</p>
                <p className="mt-2 text-foreground-muted">── Dependency vulnerabilities ──</p>
                <p className="text-emerald-400">✓ No dependency vulnerabilities found</p>
                <p className="mt-1 text-foreground-muted">── Secret scanning ──</p>
                <p className="text-emerald-400">✓ No hardcoded secrets detected</p>
                <p className="mt-1 text-foreground-muted">── Code pattern analysis ──</p>
                <p className="text-yellow-400">⚠ eval() usage  src/utils/parse.ts:42</p>
                <p className="mt-1 text-foreground-muted">── Environment files ──</p>
                <p className="text-emerald-400">✓ .env files not tracked by git</p>
                <p className="mt-3 text-foreground">  <span className="text-yellow-400 font-bold">84/100</span>  <span className="text-yellow-400">[GOOD]</span></p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>If secrets are found:</strong> rotate them immediately and assume they
                are compromised if they were ever pushed to a remote repo.
              </p>
            </div>
          </motion.section>

          {/* ── 3. Watch mode ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Eye} title="Watch mode" id="watch-mode" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Watches your source files and re-runs the scan on every save — with a 500ms debounce.
              The terminal clears and shows a fresh report each time.
            </p>
            <CodeBlock code="onboardai security --watch" />
            <div className="rounded-xl border border-border bg-[hsl(var(--code-bg))] p-4 font-mono text-xs leading-6">
              <p className="text-foreground-muted">🔒 OnboardAI — Security Monitor (watch mode)</p>
              <p className="text-foreground-muted">  Last scan: 14:23:07  ·  Ctrl+C to stop</p>
              <p className="mt-2 text-red-400">✗ Hardcoded password  src/config/db.ts:18</p>
              <p className="mt-1 text-foreground">  <span className="text-red-400 font-bold">60/100</span>  <span className="text-red-400">[NEEDS WORK]</span></p>
            </div>
            <p className="text-xs text-foreground-muted">
              Watched:{" "}
              {["src/", "app/", "lib/", "pages/", "api/"].map((d) => (
                <code key={d} className="mr-1 rounded bg-background-muted px-1 font-mono text-xs">{d}</code>
              ))}
              · Falls back to project root if none exist. Press{" "}
              <kbd className="rounded border border-border px-1.5 py-0.5 text-xs font-mono">Ctrl+C</kbd> to stop.
            </p>
          </motion.section>

          {/* ── 4. CI integration ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={GitBranch} title="CI integration" id="ci-integration" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              The{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">--quiet</code>{" "}
              flag exits with code <code className="rounded bg-background-muted px-1 font-mono text-xs">1</code> when critical or high findings are present — blocking the pipeline.
            </p>
            <div className="space-y-3">
              <Step n={1} label="GitHub Actions workflow" />
              <CodeBlock language="yaml" code={`# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx onboardai security --quiet`} />
              <Step n={2} label="Pre-commit git hook" />
              <CodeBlock language="bash" code={`# .git/hooks/pre-commit
#!/bin/sh
npx onboardai security --quiet
if [ $? -ne 0 ]; then
  echo "Security issues found — fix before committing."
  exit 1
fi`} />
              <CodeBlock code="chmod +x .git/hooks/pre-commit" />
              <Step n={3} label="Auto-install the hook via init" />
              <CodeBlock code="onboardai init" />
            </div>
          </motion.section>

          {/* ── 5. JSON output ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={FileJson} title="JSON output" id="json-output" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Use{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">--output json</code>{" "}
              to emit structured JSON — pipe it into scripts, dashboards, or <code className="rounded bg-background-muted px-1 font-mono text-xs">jq</code>.
            </p>
            <CodeBlock code="onboardai security --output json" />
            <CodeBlock code={`onboardai security --output json | jq '.findings[] | select(.severity == "critical")'`} />
            <CodeBlock code={`# Stream JSON objects in watch mode (one object per scan)
onboardai security --watch --output json`} />
            <p className="text-xs font-semibold text-foreground">Output schema</p>
            <CodeBlock language="json" code={`{
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
}`} />
          </motion.section>

          {/* ── 6. All commands ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Terminal} title="All commands" id="commands" />
            <div className="grid gap-3 sm:grid-cols-2">
              <CommandCard command="onboardai security" description="Full security audit on the current directory." flags={[
                { flag: "--watch", desc: "Re-scan on file change" },
                { flag: "--output json", desc: "Emit structured JSON to stdout" },
                { flag: "--quiet", desc: "Exit code 1 on critical/high findings" },
              ]} />
              <CommandCard command="onboardai init" description="Interactive setup: validates Node/npm, writes .env.local, installs git hooks." flags={[
                { flag: "--interactive", desc: "Force the wizard" },
              ]} />
              <CommandCard command="onboardai status" description="Environment health check — Node version, env vars, dependencies." />
              <CommandCard command="onboardai fix" description="Auto-fix common environment issues." flags={[
                { flag: "--vulnerabilities", desc: "Run npm audit fix" },
                { flag: "--env", desc: "Fill missing .env.local keys" },
                { flag: "--ports", desc: "Free blocked ports 3000 / 5432" },
                { flag: "--all", desc: "Run all fixes" },
              ]} />
              <CommandCard command="onboardai sync" description="Push local progress and scan results to the OnboardAI dashboard." flags={[
                { flag: "--api-key <key>", desc: "Override stored API key" },
              ]} />
              <CommandCard command="onboardai report" description="Generate an onboarding progress report." flags={[
                { flag: "--send-to <email>", desc: "Email the report" },
              ]} />
            </div>
          </motion.section>

          {/* ── 7. Dashboard sync ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Zap} title="Dashboard sync" id="dashboard-sync" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Sync scan results to the OnboardAI dashboard so your whole team can track security
              posture without leaving the browser.
            </p>
            <div className="space-y-3">
              <Step n={1} label="Get your API key from Settings → API" />
              <Step n={2} label="Run your first sync" />
              <CodeBlock code="onboardai sync --api-key YOUR_API_KEY" />
              <Step n={3} label="The key is stored — future syncs need no flag" />
              <CodeBlock code="onboardai sync" />
              <Step n={4} label="Scan and sync in one pipeline" />
              <CodeBlock code="onboardai security --output json | onboardai sync" />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground">View in the dashboard</p>
              <p className="mt-1 text-xs text-foreground-muted">
                After syncing, the <strong>Security</strong> page shows your score, findings
                grouped by severity, and scan history.
              </p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => (window.location.href = "/security")}>
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Go to Security
              </Button>
            </div>
          </motion.section>

          {/* ── 8. Publish to npm ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Upload} title="Publish the CLI to npm" id="publish-npm" badge="Hosting" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              To make the CLI installable via{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npm install -g onboardai</code>, you need to publish it to the npm registry. Follow these steps exactly.
            </p>

            <div className="space-y-3">
              <Step n={1} label="Make sure the entry file has a shebang" />
              <p className="text-xs text-foreground-muted">
                The compiled output at <code className="rounded bg-background-muted px-1 font-mono text-xs">cli/dist/index.js</code> must start with the Node shebang. Verify <code className="rounded bg-background-muted px-1 font-mono text-xs">cli/src/index.ts</code> has this on line 1:
              </p>
              <CodeBlock language="typescript" code={`#!/usr/bin/env node`} />

              <Step n={2} label="Verify package.json is correct" />
              <p className="text-xs text-foreground-muted">
                These three fields control how npm exposes the binary:
              </p>
              <CodeBlock language="json" code={`{
  "name": "onboardai",
  "version": "1.0.0",
  "bin": {
    "onboardai": "./dist/index.js"
  },
  "files": ["dist", "README.md"]
}`} />

              <Step n={3} label="Build the CLI" />
              <CodeBlock code={`cd cli
npm run build
# Compiles src/ → dist/ via tsc`} />

              <Step n={4} label="Create an npm account (if you don't have one)" />
              <CodeBlock code="npm adduser" />

              <Step n={5} label="Log in to npm" />
              <CodeBlock code="npm login" />

              <Step n={6} label="Dry-run first — see exactly what will be published" />
              <CodeBlock code={`cd cli
npm publish --dry-run`} />
              <p className="text-xs text-foreground-muted">
                Confirm the output only includes <code className="rounded bg-background-muted px-1 font-mono text-xs">dist/</code> and <code className="rounded bg-background-muted px-1 font-mono text-xs">README.md</code> — never <code className="rounded bg-background-muted px-1 font-mono text-xs">src/</code> or <code className="rounded bg-background-muted px-1 font-mono text-xs">.env</code> files.
              </p>

              <Step n={7} label="Publish" />
              <CodeBlock code={`cd cli
npm publish --access public`} />
              <p className="text-xs text-foreground-muted">
                The <code className="rounded bg-background-muted px-1 font-mono text-xs">--access public</code> flag is required for scoped packages (e.g.{" "}
                <code className="rounded bg-background-muted px-1 font-mono text-xs">@yourorg/onboardai</code>). Unscoped packages are public by default.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Releasing a new version
              </p>
              <p className="text-xs text-foreground-muted">
                Bump the version in <code className="rounded bg-background-muted px-1 font-mono text-xs">cli/package.json</code>, build, then publish. Use semantic versioning.
              </p>
              <CodeBlock code={`# Patch fix  → 1.0.0 → 1.0.1
npm version patch --prefix cli

# Minor feature → 1.0.0 → 1.1.0
npm version minor --prefix cli

# Breaking change → 1.0.0 → 2.0.0
npm version major --prefix cli

# Then build and publish
cd cli && npm run build && npm publish`} />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Package name conflicts:</strong> if <code className="font-mono">onboardai</code> is already taken on npm, either scope it as <code className="font-mono">@your-username/onboardai</code> or choose a unique name and update the <code className="font-mono">bin</code> key accordingly.
              </p>
            </div>
          </motion.section>

          {/* ── 9. Local development ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Wrench} title="Local development" id="local-dev" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              Test the CLI locally before publishing — no npm publish needed. Use{" "}
              <code className="rounded bg-background-muted px-1 font-mono text-xs">npm link</code>{" "}
              to symlink the binary into your global PATH.
            </p>

            <div className="space-y-3">
              <Step n={1} label="Install CLI dependencies" />
              <CodeBlock code={`cd cli
npm install`} />

              <Step n={2} label="Build in watch mode during development" />
              <CodeBlock code={`cd cli
npx tsc --watch`} />

              <Step n={3} label="Link globally so onboardai resolves in any terminal" />
              <CodeBlock code={`cd cli
npm link`} />
              <p className="text-xs text-foreground-muted">
                This creates a symlink: <code className="rounded bg-background-muted px-1 font-mono text-xs">~/.nvm/versions/.../bin/onboardai → cli/dist/index.js</code>
              </p>

              <Step n={4} label="Test the command in any directory" />
              <CodeBlock code={`cd ~/your-other-project
onboardai security`} />

              <Step n={5} label="Unlink when done" />
              <CodeBlock code={`cd cli
npm unlink`} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Run directly with ts-node (skip the build step)
              </p>
              <p className="text-xs text-foreground-muted">During active development you can skip the build entirely:</p>
              <CodeBlock code={`cd cli
npx ts-node src/index.ts security --watch`} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                Install missing devDependencies in the CLI package
              </p>
              <p className="text-xs text-foreground-muted">
                The CLI has its own <code className="rounded bg-background-muted px-1 font-mono text-xs">package.json</code> in <code className="rounded bg-background-muted px-1 font-mono text-xs">cli/</code>. Run <code className="rounded bg-background-muted px-1 font-mono text-xs">npm install</code> inside that directory, not the root.
              </p>
              <CodeBlock code={`cd cli
npm install
# Installs: commander, chalk, ora, axios, inquirer, fs-extra, semver, execa`} />
            </div>
          </motion.section>

          {/* ── 10. What gets scanned ── */}
          <motion.section variants={fadeInUp} className="space-y-5">
            <SectionHeading icon={Shield} title="What gets scanned" id="what-is-scanned" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Hardcoded secrets",
                  items: [
                    "AWS Access / Secret Keys",
                    "GitHub personal tokens (ghp_*)",
                    "OpenAI keys (sk-*)",
                    "Stripe live keys",
                    "JWT secrets",
                    "Database URLs with credentials",
                    "Generic API secrets",
                    "Private key PEM blocks",
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
                    "Command injection via exec template literals",
                    "Insecure random for token generation",
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

            <div className="space-y-1">
              <p className="text-xs text-foreground-muted">
                <span className="font-medium text-foreground">Scanned file types: </span>
                {[".ts", ".tsx", ".js", ".jsx", ".env", ".json"].map((ext) => (
                  <code key={ext} className="mr-1 rounded bg-background-muted px-1 font-mono text-xs">{ext}</code>
                ))}
              </p>
              <p className="text-xs text-foreground-muted">
                <span className="font-medium text-foreground">Ignored directories: </span>
                {["node_modules/", ".next/", "dist/", "build/", "coverage/"].map((d) => (
                  <code key={d} className="mr-1 rounded bg-background-muted px-1 font-mono text-xs">{d}</code>
                ))}
              </p>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-between border-t border-border pt-8 text-xs text-foreground-muted"
          >
            <span>OnboardAI CLI · MIT License</span>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
              <a href="/security" className="hover:text-foreground transition-colors">Security</a>
              <a href="/sign-in" className="hover:text-foreground transition-colors">Sign in</a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
