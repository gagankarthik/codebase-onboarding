# OnboardAI CLI

> Accelerate developer onboarding — security scanning, environment setup, web event monitoring, and dashboard sync — all from your terminal.

```
npm install -g onboardai
onboardai security
```

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [security](#onboardai-security)
  - [init](#onboardai-init)
  - [status](#onboardai-status)
  - [fix](#onboardai-fix)
  - [monitor](#onboardai-monitor)
  - [sync](#onboardai-sync)
  - [report](#onboardai-report)
  - [share](#onboardai-share)
- [Watch Mode](#watch-mode)
- [JSON Output & Piping](#json-output--piping)
- [CI Integration](#ci-integration)
- [Dashboard Sync](#dashboard-sync)
- [Web Event Monitoring](#web-event-monitoring)
- [Local Development](#local-development)
- [Publishing to npm](#publishing-to-npm)
- [Requirements](#requirements)

---

## Installation

```bash
# Install globally
npm install -g onboardai

# Or run without installing
npx onboardai security

# Verify
onboardai --version
```

**Requirements:** Node.js ≥ 18.0.0, npm ≥ 8.0.0

---

## Quick Start

```bash
# 1. Navigate to your project
cd /path/to/your-project

# 2. Set up your development environment
onboardai init

# 3. Run a security audit
onboardai security

# 4. Check environment health
onboardai status
```

---

## Commands

### `onboardai security`

Scans your codebase for hardcoded secrets, unsafe code patterns, dependency vulnerabilities, and exposed `.env` files. Produces a score from 0–100.

```bash
onboardai security
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--watch` | Re-scan automatically on every file save (500ms debounce) |
| `--output json` | Emit structured JSON to stdout instead of formatted output |
| `--quiet` | Exit with code `1` when critical or high findings are present (for CI/git hooks) |

**What gets scanned:**

*Secrets (severity: critical)*
- AWS Access Keys (`AKIA…`)
- AWS Secret Keys
- GitHub personal tokens (`ghp_…`)
- OpenAI keys (`sk-…`)
- Stripe live keys (`sk_live_…`)
- JWT secrets
- Database URLs with embedded credentials
- Private key PEM blocks
- Hardcoded passwords
- Generic API secrets

*Code patterns (severity: high/medium/low)*
- `eval()` usage — high
- SQL string concatenation / template literal injection — high
- Command injection via exec template literals — high
- `Math.random()` used for token generation — high
- Prototype pollution (`__proto__`) — high
- `innerHTML` assignment — medium
- `dangerouslySetInnerHTML` — medium
- Unsafe `JSON.parse` on request input — medium
- Unsafe regex (ReDoS risk) — medium
- `document.write` — medium
- Hard-coded localhost URLs — low

**Scoring:**
- Starts at 100
- Each secret finding: −20
- High code finding: −8 / Medium: −4 / Low: −1
- Critical dependency: −15 / High: −8 / Moderate: −3 / Low: −1
- Exposed `.env` file: −10

**Example output:**
```
  🔒 OnboardAI — Security Audit
  ─────────────────────────────────────────

  ── Dependency vulnerabilities ──
  ✓ No dependency vulnerabilities found

  ── Secret scanning ──
  ✓ No hardcoded secrets detected

  ── Code pattern analysis ──
  ⚠ eval() usage  src/utils/parse.ts:42

  ── Environment files ──
  ✓ .env files not tracked by git

  Security Score
  ────────────────────────────────────
  [████████████████████░░░░] 84/100  [GOOD]
```

---

### `onboardai init`

Interactive environment setup wizard. Checks Node/npm/git versions, installs dependencies, copies `.env.example` → `.env.local`, and installs a git pre-commit security hook.

```bash
onboardai init

# Run the full interactive wizard (role, team, VS Code settings)
onboardai init --interactive
```

**What it does:**
1. Validates Node.js ≥ 18 and npm installation
2. Runs `npm install` if `node_modules` is missing
3. Copies `.env.example` to `.env.local` if it doesn't exist
4. Reports missing/empty env keys
5. Installs a git pre-commit hook that runs `onboardai security --quiet`
6. Optionally runs an interactive wizard for role/team/VS Code configuration

**Flags:**

| Flag | Description |
|------|-------------|
| `--interactive` | Force the full interactive setup wizard |

---

### `onboardai status`

Full environment health check — runtime versions, dependencies, env config, port availability, and git state.

```bash
onboardai status
```

**Checks performed:**
- Node.js and npm versions (warns if < 18)
- `package.json` and `node_modules` presence
- `npm audit` vulnerability count
- `.env.local` completeness (vs `.env.example`)
- Ports 3000 (Next.js) and 5432 (PostgreSQL) availability
- Git repo detection and commit count

---

### `onboardai fix`

Auto-fixes common environment issues. Pass one or more flags to specify what to fix.

```bash
# Fix npm vulnerabilities
onboardai fix --vulnerabilities

# Fill missing keys in .env.local
onboardai fix --env

# Free blocked ports
onboardai fix --ports

# Run all fixes at once
onboardai fix --all
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--vulnerabilities` | Runs `npm audit fix` to resolve fixable CVEs |
| `--env` | Copies missing keys from `.env.example` into `.env.local` (values left empty) |
| `--ports` | Interactively kills processes on ports 3000 and 5432 |
| `--all` | Runs all three fixes in sequence |

---

### `onboardai monitor`

Continuously monitors web events (errors, warnings, page views, API errors, performance events) from your connected app and streams them to your terminal. Optionally uses AI to analyze errors as they arrive.

```bash
# Basic monitoring (first connected repo)
onboardai monitor --api-key YOUR_KEY

# Monitor a specific repo
onboardai monitor --repo REPO_ID --api-key YOUR_KEY

# With AI analysis (auto-analyzes errors as they arrive)
onboardai monitor --ai --api-key YOUR_KEY

# Custom polling interval (default: 10s)
onboardai monitor --interval 5 --ai --api-key YOUR_KEY
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--repo <repoId>` | Repo ID to monitor (defaults to your first connected repo) |
| `--interval <seconds>` | Polling interval in seconds (min: 5, default: 10) |
| `--ai` | Auto-analyze errors with AI as they arrive |
| `--api-key <key>` | Your OnboardAI API key (saved after first use) |

**Event types displayed:**

| Type | Icon | Color |
|------|------|-------|
| `error` | ✗ | Red |
| `api_error` | ✗ | Red |
| `warning` | ⚠ | Yellow |
| `page_view` | → | Blue |
| `performance` | ⚡ | Magenta |
| `info` | ℹ | Gray |

**AI analysis output (with `--ai`):**
```
  ✦ AI Analysis
  ─────────────────────────────────────────
  Confidence: high

  What happened:
  TypeError: Cannot read properties of undefined (reading 'map')

  Root cause:
  The API response returned null instead of an array before the .map() call

  Where to fix:
  src/components/RepoList.tsx:47

  How to fix:
  → Add a null check before calling .map(): (data?.repos ?? []).map(...)
  → Or add optional chaining: data.repos?.map(...)
```

**Sending events from your app:**

Use the browser SDK snippet from the Events page in the dashboard, or POST directly to the ingest endpoint:

```js
// POST /api/events/ingest
// Headers: x-api-key: YOUR_KEY

fetch('https://your-app.com/api/events/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_KEY',
  },
  body: JSON.stringify({
    repoId: 'REPO_ID',
    type: 'error',           // error | warning | page_view | api_error | performance | info
    message: 'TypeError: ...',
    url: window.location.href,
    filename: 'src/app/page.tsx',
    lineno: 42,
    metadata: {},
  }),
})
```

---

### `onboardai sync`

Syncs your local onboarding progress (Node version, deps, env config, git commits, security score) to the OnboardAI dashboard.

```bash
# First time — provide your API key
onboardai sync --api-key YOUR_KEY

# Subsequent syncs — key is saved automatically
onboardai sync
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Your OnboardAI API key (saved for future use after first sync) |

**Data synced:**
- Project name
- Node.js and npm versions
- Whether dependencies are installed
- Vulnerability count
- Env variable completeness
- Git commit count
- First PR status (read from `.onboardai.json`)

---

### `onboardai report`

Generates an onboarding progress report and optionally emails it.

```bash
onboardai report
onboardai report --send-to manager@company.com
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--send-to <email>` | Email address to send the report to |

---

### `onboardai share`

Generates a shareable Markdown context summary of the project — useful for async handoffs and onboarding documentation.

```bash
onboardai share
onboardai share --context
```

---

## Watch Mode

Watch mode re-runs the security scan on every file save in `src/`, `app/`, `lib/`, `pages/`, and `api/`. Falls back to the project root if none of these directories exist. A 500ms debounce prevents repeated scans on rapid saves.

```bash
onboardai security --watch
```

The terminal clears and shows a fresh timestamped report on each scan. Press `Ctrl+C` to stop.

**Watch mode + JSON output** emits one JSON object per scan to stdout:

```bash
# Stream JSON scan results to a file
onboardai security --watch --output json >> scans.jsonl
```

---

## JSON Output & Piping

```bash
# Pretty-print JSON
onboardai security --output json

# Filter for critical findings only
onboardai security --output json | jq '.findings[] | select(.severity == "critical")'

# Count total findings
onboardai security --output json | jq '.findings | length'

# Pipe into a dashboard or monitoring system
onboardai security --output json | curl -X POST https://your-api.com/ingest \
  -H "Content-Type: application/json" \
  -d @-
```

**JSON schema:**

```json
{
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
}
```

---

## CI Integration

Use `--quiet` to make the scan exit with code `1` on critical/high findings, blocking the pipeline.

**GitHub Actions:**

```yaml
# .github/workflows/security.yml
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
      - run: npx onboardai security --quiet
```

**Pre-commit git hook (manual):**

```bash
# .git/hooks/pre-commit
#!/bin/sh
npx onboardai security --quiet
if [ $? -ne 0 ]; then
  echo "Security issues found — fix before committing."
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

**Auto-install via init:**

```bash
# Installs the hook automatically
onboardai init
```

---

## Dashboard Sync

Connect the CLI to the OnboardAI web dashboard to track security posture, onboarding progress, and web events across your team.

```bash
# 1. Get your API key from Settings → API in the dashboard
# 2. Run first sync
onboardai sync --api-key YOUR_KEY

# Key is stored — future syncs need no flag
onboardai sync

# Scan and sync in one pipeline
onboardai security --output json | onboardai sync
```

After syncing, the **Security** page in the dashboard shows your score history, findings grouped by severity, and scan trends.

---

## Web Event Monitoring

The `monitor` command connects your terminal to the live event stream from your web app. No code changes are needed if you already have the tracking snippet installed.

**Quick setup:**

1. Get the tracking snippet from **Events** page in the dashboard
2. Add it to your app's HTML `<head>` or use the React hook
3. Run `onboardai monitor --ai --api-key YOUR_KEY`

**The SDK captures automatically:**
- `window.onerror` — unhandled JS errors with file/line info
- `window.onunhandledrejection` — unhandled Promise rejections
- `fetch` / `XMLHttpRequest` failures — API errors with status codes
- Page navigation events

---

## Local Development

Test the CLI locally without publishing to npm.

```bash
# 1. Install dependencies
cd cli
npm install

# 2. Build
npm run build

# 3. Link globally (creates onboardai symlink in your PATH)
npm link

# 4. Test in any project
cd ~/some-other-project
onboardai security

# 5. Rebuild on changes
cd /path/to/cli
npx tsc --watch   # in one terminal
# onboardai now picks up changes immediately after each build

# 6. Unlink when done
cd /path/to/cli
npm unlink
```

**Skip the build with ts-node:**

```bash
cd cli
npx ts-node src/index.ts security --watch
```

---

## Publishing to npm

```bash
# 1. Make sure the shebang is on line 1 of src/index.ts
#!/usr/bin/env node

# 2. Build
cd cli && npm run build

# 3. Dry-run (verify only dist/ and README.md are included)
npm publish --dry-run

# 4. Publish
npm publish --access public
```

**Releasing a new version:**

```bash
# Patch: 1.0.0 → 1.0.1
npm version patch --prefix cli

# Minor: 1.0.0 → 1.1.0
npm version minor --prefix cli

# Major: 1.0.0 → 2.0.0
npm version major --prefix cli

# Build and publish
cd cli && npm run build && npm publish
```

> **Note:** If the package name `onboardai` is already taken on npm, scope it as `@your-username/onboardai` and update the `name` and `bin` fields in `cli/package.json` accordingly.

---

## Requirements

| Requirement | Minimum version |
|-------------|----------------|
| Node.js | 18.0.0 |
| npm | 8.0.0 |
| Git | Any (optional, for hook installation) |

---

## License

MIT © OnboardAI
