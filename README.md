# OnboardAI — Codebase Onboarding Accelerator

> Connect a GitHub repo. Fill in a short form. Get a personalised, AI-generated onboarding guide so new engineers ship their first PR in days — not months.

**Stack:** Next.js 14 (App Router) · GitHub OAuth · AWS DynamoDB · GPT-4o mini · Tailwind CSS · TypeScript

---

## Table of Contents

- [Overview](#overview)
- [User Flow](#user-flow)
- [Features](#features)
  - [Onboarding Guides](#onboarding-guides)
  - [Codebase Analysis](#codebase-analysis)
  - [Chat with Your Codebase](#chat-with-your-codebase)
  - [Repo Analytics](#repo-analytics)
  - [Security Scanning](#security-scanning)
  - [Error Logging & Alert Rules](#error-logging--alert-rules)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [DynamoDB Tables](#dynamodb-tables)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [CLI (`onboardai`)](#cli-onboardai)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

OnboardAI connects to a team's GitHub repository, uses GPT-4o mini to analyse the codebase, and generates a personalised onboarding guide for each new hire in minutes. No manual documentation. No stale wikis.

Beyond onboarding, the platform is a full developer-intelligence layer on top of your repos: codebase structure analysis, commit & contributor analytics, security scanning for secrets and vulnerabilities, and real-time runtime error logging with configurable alert rules.

---

## User Flow

```
GitHub OAuth Login
       │
       ▼
Select Repository ──► System Fetches Repo Data
       │
       ▼
   Choose Action
  ┌────┬────┬────┬────┬────┐
  │    │    │    │    │    │
  ▼    ▼    ▼    ▼    ▼    ▼
Analyze  Chat  Repo  Security  Error
Code     AI   Analytics  Scan  Logging
  │            │                │
Structure   Commits        Alert Rules
Tech Stack  Contributors   Log Viewer
Complexity  Hot Files      Runtime Errors
```

Every feature path checks whether the `onboardai` CLI npm package is installed and prompts the user to install it if missing, enabling local CLI sync and security scanning.

---

## Features

### Onboarding Guides

Fill a short intake form (new hire name, role, team, first sprint focus). The AI reads your repo and generates:

- **Architecture overview** — plain-English description of the codebase
- **Key modules** — annotated file map with role-relevance badges
- **Coding conventions** — detected rules from real code (not from a wiki)
- **Setup steps** — reproduction of steps to run the project locally
- **Starter tasks** — 3 good-first-issues ranked by difficulty
- **First week focus** — personalised focus area based on role and sprint
- **Tribal knowledge** — unwritten conventions inferred from patterns

Guides auto-refresh on every push to `main` via GitHub webhook.

### Codebase Analysis

Navigate to **Repos → [repo] → Analyze Codebase**.

| Section | What it shows |
|---|---|
| Complexity metrics | Total files, total lines, avg file size, test file count, dependency count |
| Tech stack | Languages, frameworks, tools, databases — detected from extensions and `package.json` |
| Directory breakdown | File count per top-level directory, rendered as a bar chart |
| Largest files | Top 5 files by line count |
| Entry points | Detected `index.*`, `main.*`, `app.*`, `server.*` files |

### Chat with Your Codebase

Navigate to **Onboarding → [onboarding] → Chat**.

- Ask "How does auth work?", "What's the database schema?", "How do I run tests?"
- Responses are grounded in actual file contents (RAG over repo snapshot)
- Code blocks rendered with syntax highlighting and a copy button
- Full conversation history persisted in DynamoDB

### Repo Analytics

Navigate to **Repos → [repo] → Repo Analytics**.

Powered by the GitHub Stats API:

| Metric | Detail |
|---|---|
| Commit activity | Weekly bar chart for the last 26 weeks |
| Top contributors | Ranked by commits, with additions/deletions and weeks active |
| Most changed files | Files most frequently touched in the last 30 commits |

### Security Scanning

Navigate to **Security** or run `onboardai security` in your project.

- **Secret detection** — AWS keys, GitHub tokens, OpenAI keys, Stripe keys, private keys, hardcoded passwords, JWT secrets, database URLs
- **Unsafe code patterns** — `eval()`, `innerHTML`, SQL concatenation, `Math.random` for tokens, command injection, `__proto__`, unsafe deserialization
- **Dependency audit** — npm vulnerability count (critical / high / medium / low)
- **Score** — 0–100 security score with per-finding severity breakdown

### Error Logging & Alert Rules

Navigate to **Events** and embed the browser SDK in your app.

**Event types tracked:** `error`, `api_error`, `warning`, `page_view`, `performance`, `info`

**Alert Rules** — create rules that fire when thresholds are crossed:

| Condition | When it fires |
|---|---|
| `error_count` | Error count exceeds N in a rolling window |
| `critical_error` | Any critical error occurs |
| `high_error_rate` | Error rate exceeds threshold |
| `new_error_type` | A previously unseen error type is detected |

Actions: `log` (always), `email` (to a specified address), `webhook` (POST to a URL).

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI, streaming API routes, SSR |
| Auth | GitHub OAuth + custom JWT session | Sign-in, per-request auth |
| Database | AWS DynamoDB | All data persistence — 11 tables |
| AI | OpenAI GPT-4o mini | Guide generation, chat (RAG), event analysis |
| GitHub | Octokit REST v3 | Repo tree, file contents, stats, PRs, issues |
| Styling | Tailwind CSS + shadcn/ui | Utility-first design system |
| Animation | Framer Motion | Page transitions and stagger lists |
| CLI | `onboardai` (npm) | Local security scanning, env check, dashboard sync |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Amplify (Hosting)                 │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Next.js App (App Router)             │  │
│  │                                                   │  │
│  │  ┌─────────────┐    ┌──────────────────────────┐ │  │
│  │  │  Pages/UI   │    │     API Routes           │ │  │
│  │  │             │    │  /api/repos/ingest        │ │  │
│  │  │  Dashboard  │    │  /api/onboarding/create   │ │  │
│  │  │  Guide View │    │  /api/chat                │ │  │
│  │  │  Chat UI    │    │  /api/guide/refresh       │ │  │
│  │  └─────────────┘    └──────────┬───────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                              │                          │
└──────────────────────────────┼──────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │ AWS Cognito │    │  DynamoDB    │    │ OpenAI API   │
   │             │    │              │    │              │
   │  User Pool  │    │  Users       │    │ GPT-4o mini  │
   │  JWT Auth   │    │  Repos       │    │              │
   └─────────────┘    │  Guides      │    │ Guide gen    │
                      │  Onboardings │    │ Chat / RAG   │
                      │  Messages    │    └──────────────┘
                      └──────────────┘
                               │
                               ▼
                      ┌──────────────┐
                      │  GitHub API  │
                      │              │
                      │  Repo tree   │
                      │  File read   │
                      │  PR history  │
                      │  Issues      │
                      └──────────────┘
```

---

## Project Structure

```
codebase-onboarding/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Repo list, recent onboardings
│   │   ├── repos/
│   │   │   ├── connect/
│   │   │   │   └── page.tsx      # GitHub OAuth callback
│   │   │   └── [repoId]/
│   │   │       └── page.tsx      # Repo detail + onboarding list
│   │   └── onboarding/
│   │       ├── new/
│   │       │   └── page.tsx      # Create new onboarding (intake form)
│   │       └── [onboardingId]/
│   │           ├── page.tsx      # Guide view for new hire
│   │           └── chat/
│   │               └── page.tsx  # Chat with codebase
│   ├── api/
│   │   ├── repos/
│   │   │   ├── connect/
│   │   │   │   └── route.ts      # GitHub OAuth
│   │   │   └── ingest/
│   │   │       └── route.ts      # Ingest repo → DynamoDB
│   │   ├── onboarding/
│   │   │   ├── create/
│   │   │   │   └── route.ts      # Create onboarding record
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET / UPDATE onboarding
│   │   ├── guide/
│   │   │   ├── generate/
│   │   │   │   └── route.ts      # Trigger GPT guide generation
│   │   │   └── refresh/
│   │   │       └── route.ts      # Re-generate on push webhook
│   │   ├── chat/
│   │   │   └── route.ts          # RAG chat endpoint (streaming)
│   │   └── webhooks/
│   │       └── github/
│   │           └── route.ts      # GitHub push webhook
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx
│   │   └── SignUpForm.tsx
│   ├── dashboard/
│   │   ├── RepoCard.tsx
│   │   └── OnboardingList.tsx
│   ├── guide/
│   │   ├── GuideViewer.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── StarterTasks.tsx
│   │   └── ProgressBar.tsx
│   └── chat/
│       ├── ChatWindow.tsx
│       ├── ChatMessage.tsx
│       └── ChatInput.tsx
│
├── lib/
│   ├── auth/
│   │   └── cognito.ts            # Cognito client + helpers
│   ├── db/
│   │   ├── client.ts             # DynamoDB DocumentClient
│   │   ├── repos.ts              # Repo CRUD
│   │   ├── onboardings.ts        # Onboarding CRUD
│   │   └── guides.ts             # Guide CRUD
│   ├── github/
│   │   ├── client.ts             # GitHub REST client
│   │   ├── ingest.ts             # Repo tree + file reading
│   │   └── issues.ts             # Open issues fetcher
│   ├── openai/
│   │   ├── client.ts             # OpenAI client
│   │   ├── generateGuide.ts      # Guide generation prompt + call
│   │   └── chat.ts               # RAG chat with codebase context
│   └── utils/
│       ├── tokenCount.ts         # Stay within GPT-4o mini context
│       └── fileFilter.ts         # Skip node_modules, lock files etc
│
├── types/
│   ├── repo.ts
│   ├── onboarding.ts
│   └── guide.ts
│
├── amplify/                      # Amplify backend config
│   └── backend/
│       └── backend-config.json
│
├── public/
├── .env.local                    # Local secrets (never commit)
├── .env.example                  # Template — safe to commit
├── amplify.yml                   # Amplify build config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with IAM user (Cognito + DynamoDB + Amplify permissions)
- OpenAI API key
- GitHub OAuth App (for repo connection)

### 1. Clone and install

```bash
git clone https://github.com/your-org/codebase-onboarding.git
cd codebase-onboarding
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in all values — see Environment Variables section below
```

### 3. Set up AWS resources

Follow the [AWS Setup](#aws-setup) section to create your Cognito User Pool, DynamoDB tables, and Amplify app.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in every value before running locally.

```env
# ─── Next.js ───────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# ─── AWS Cognito ───────────────────────────────────────
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ─── AWS DynamoDB ──────────────────────────────────────
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=coa-prod    # Tables: coa-prod-users, coa-prod-repos, etc.

# ─── OpenAI ────────────────────────────────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# ─── GitHub OAuth App ──────────────────────────────────
GITHUB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URI=http://localhost:3000/api/repos/connect

# ─── GitHub Webhook ────────────────────────────────────
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# ─── AWS Amplify (auto-injected in Amplify hosting) ────
# AMPLIFY_APP_ID — set automatically by Amplify
```

> **Never commit `.env.local`.** It is already in `.gitignore`. For production, add these as environment variables in the Amplify Console.

---

## AWS Setup

### Cognito

1. Open the **AWS Console → Cognito → Create User Pool**
2. Sign-in options: **Email**
3. Password policy: minimum 8 characters (adjust to taste)
4. MFA: optional (recommend TOTP for production)
5. Required attributes: `email`, `name`
6. App client settings:
   - App type: **Public client**
   - Auth flows: `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
   - No client secret (required for Amplify Auth from browser)
7. Copy the **User Pool ID** and **App Client ID** into `.env.local`

```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Configure Amplify with your AWS credentials
amplify configure

# Pull existing Amplify backend (after first deploy) or init new
amplify init
amplify add auth   # Choose Cognito defaults
amplify push
```

### DynamoDB

Create the following tables in DynamoDB. All tables use **on-demand billing** (pay per request) — ideal for early-stage.

See the full [DynamoDB Schema](#dynamodb-schema) section for attribute details.

```bash
# You can create tables via AWS Console or use this AWS CLI script

aws dynamodb create-table \
  --table-name coa-prod-users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name coa-prod-repos \
  --attribute-definitions AttributeName=repoId,AttributeType=S \
  --key-schema AttributeName=repoId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name coa-prod-onboardings \
  --attribute-definitions \
    AttributeName=onboardingId,AttributeType=S \
    AttributeName=repoId,AttributeType=S \
  --key-schema AttributeName=onboardingId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{
    "IndexName": "repoId-index",
    "KeySchema": [{"AttributeName":"repoId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]'

aws dynamodb create-table \
  --table-name coa-prod-guides \
  --attribute-definitions \
    AttributeName=guideId,AttributeType=S \
    AttributeName=onboardingId,AttributeType=S \
  --key-schema AttributeName=guideId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{
    "IndexName": "onboardingId-index",
    "KeySchema": [{"AttributeName":"onboardingId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]'

aws dynamodb create-table \
  --table-name coa-prod-messages \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
    AttributeName=onboardingId,AttributeType=S \
  --key-schema AttributeName=messageId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{
    "IndexName": "onboardingId-index",
    "KeySchema": [{"AttributeName":"onboardingId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]'
```

### Amplify Deployment

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Connect your GitHub repo to Amplify Console
# 1. AWS Console → Amplify → New App → Host Web App
# 2. Connect GitHub repo
# 3. Select branch: main
# 4. Add all environment variables from .env.local into Amplify Console
# 5. Deploy

# amplify.yml (already in repo root) handles build settings:
```

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

---

## GitHub Integration

The app connects to GitHub via an OAuth App (not a GitHub App) — simpler to set up, sufficient for reading repos.

### Create a GitHub OAuth App

1. GitHub → Settings → Developer Settings → OAuth Apps → **New OAuth App**
2. Homepage URL: `https://your-amplify-url.amplifyapp.com`
3. Authorization callback URL: `https://your-amplify-url.amplifyapp.com/api/repos/connect`
4. Copy **Client ID** and **Client Secret** to `.env.local`

### Repo ingestion flow

```
User clicks "Connect Repo"
  → Redirect to GitHub OAuth
  → GitHub redirects back with code
  → /api/repos/connect exchanges code for access token
  → Store token encrypted in DynamoDB (coa-prod-repos)
  → /api/repos/ingest reads repo tree (top 200 files, skip node_modules/lock files)
  → File contents stored for AI context
  → Guide generation triggered
```

### Webhook for auto-refresh

Set up a webhook on the connected repo so guides auto-refresh when code changes:

1. Repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://your-app.com/api/webhooks/github`
3. Content type: `application/json`
4. Secret: value of `GITHUB_WEBHOOK_SECRET` in your env
5. Events: **Just the push event**

---

## GPT-4o mini Integration

### Why GPT-4o mini

- 128K context window — enough for most codebases after filtering
- Significantly cheaper than GPT-4o (~15x cost reduction)
- Fast enough for interactive chat responses
- Sufficient capability for code explanation and summarisation tasks

### Guide generation

The guide generation prompt sends GPT-4o mini:

1. **Repo structure** — file tree (filtered, top 200 files)
2. **Key file contents** — README, main entry points, config files, most-changed files from recent commits
3. **Intake form data** — new hire's role, team, first sprint focus area
4. **Recent PR titles** — to infer coding patterns and conventions

Output format requested (JSON):

```json
{
  "architectureOverview": "...",
  "keyModules": [
    {
      "name": "...",
      "path": "...",
      "purpose": "...",
      "relevantForRole": true
    }
  ],
  "codingConventions": ["...", "..."],
  "setupSteps": ["...", "..."],
  "starterTasks": [
    {
      "issueNumber": 42,
      "title": "...",
      "difficulty": "easy" | "medium" | "hard",
      "why": "Good first issue because..."
    }
  ],
  "firstWeekFocus": "..."
}
```

### Chat (RAG)

The chat endpoint uses a simple retrieval approach:

1. New hire sends a question
2. Relevant file contents are retrieved from the stored repo snapshot (keyword + semantic matching)
3. Top 3–5 relevant files are included as context in the GPT-4o mini prompt
4. Response streamed back using Next.js streaming API routes

```typescript
// lib/openai/chat.ts — simplified
export async function chatWithCodebase(
  question: string,
  repoContext: RepoFile[],
  conversationHistory: Message[]
) {
  const relevantFiles = retrieveRelevantFiles(question, repoContext);

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are an expert on this codebase. Answer questions using only the provided code context. 
                  Be specific — reference file paths and function names. If you don't know, say so.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: `Code context:\n${relevantFiles.map(f => `// ${f.path}\n${f.content}`).join('\n\n')}\n\nQuestion: ${question}`,
      },
    ],
    max_tokens: 1000,
  });

  return response;
}
```

---

## DynamoDB Tables

All tables use the prefix `DYNAMODB_TABLE_PREFIX` (default `coa`). Table names follow the pattern `{prefix}-{name}`.

> **GSI** = Global Secondary Index. Create these in the AWS Console or via IaC before running the app.

### `coa-users`

PK: `userId`

| Attribute | Type | Notes |
|---|---|---|
| `userId` | String | GitHub user ID |
| `email` | String | |
| `name` | String | |
| `plan` | String | `starter` \| `growth` \| `scale` |
| `apiKey` | String | `coa_…` — auto-generated on first request |
| `createdAt` | String | ISO timestamp |

### `coa-repos`

PK: `repoId` · GSI: `userId-createdAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `repoId` | String | UUID |
| `userId` | String | |
| `githubRepoId` | Number | GitHub internal repo ID |
| `fullName` | String | e.g. `acme/backend-api` |
| `fileSnapshot` | String | JSON — repo tree + file contents |
| `lastIngestedAt` | String | ISO timestamp |
| `webhookId` | Number | GitHub webhook ID |

### `coa-onboardings`

PK: `onboardingId` · GSI: `repoId-createdAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `onboardingId` | String | UUID |
| `repoId` | String | |
| `newHireName` | String | |
| `newHireEmail` | String | |
| `role` | String | |
| `team` | String | |
| `firstSprintFocus` | String | |
| `status` | String | `pending` \| `generating` \| `ready` \| `error` |
| `firstPrAt` | String | Set when first PR opened |
| `createdAt` | String | |

### `coa-guides`

PK: `guideId` · GSI: `onboardingId-generatedAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `guideId` | String | UUID |
| `onboardingId` | String | |
| `architectureOverview` | String | |
| `keyModules` | List | `GuideModule[]` |
| `codingConventions` | List | `string[]` |
| `setupSteps` | List | `string[]` |
| `starterTasks` | List | `StarterTask[]` |
| `firstWeekFocus` | String | |
| `tribalKnowledge` | List | `ConventionInsight[]` |
| `generatedAt` | String | |
| `version` | Number | Increments on refresh |

### `coa-messages`

PK: `messageId` · GSI: `onboardingId-createdAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `messageId` | String | UUID |
| `onboardingId` | String | |
| `role` | String | `user` \| `assistant` |
| `content` | String | |
| `citations` | List | File paths cited by AI |
| `createdAt` | String | |

### `coa-web-events`

PK: `eventId` · GSI: `repoId-createdAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `eventId` | String | UUID |
| `repoId` | String | |
| `type` | String | `error` \| `api_error` \| `warning` \| `page_view` \| `performance` \| `info` |
| `message` | String | |
| `stack` | String | Stack trace |
| `url` | String | Page URL |
| `analysis` | Map | AI root-cause analysis |
| `createdAt` | String | |

### `coa-alert-rules`

PK: `ruleId` · GSI: `repoId-createdAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `ruleId` | String | UUID |
| `repoId` | String | |
| `name` | String | |
| `condition` | String | `error_count` \| `critical_error` \| `high_error_rate` \| `new_error_type` |
| `threshold` | Number | Errors before rule fires |
| `windowMinutes` | Number | Rolling window |
| `action` | String | `log` \| `email` \| `webhook` |
| `actionTarget` | String | Email address or webhook URL |
| `enabled` | Boolean | |
| `triggeredCount` | Number | Lifetime trigger count |
| `lastTriggeredAt` | String | ISO timestamp |
| `createdAt` | String | |

### `coa-analysis`

PK: `analysisId` · GSI: `repoId-analyzedAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `analysisId` | String | UUID |
| `repoId` | String | |
| `directoryTree` | List | `DirectoryNode[]` |
| `techStack` | List | `TechStackEntry[]` |
| `complexity` | Map | `ComplexityMetrics` |
| `entryPoints` | List | `string[]` |
| `analyzedAt` | String | ISO timestamp |

### `coa-security-scans`

PK: `scanId` · GSI: `repoId-scannedAt-index`

| Attribute | Type | Notes |
|---|---|---|
| `scanId` | String | UUID |
| `repoId` | String | |
| `score` | Number | 0–100 |
| `findings` | List | `SecurityFinding[]` |
| `dependencyVulnerabilities` | Map | counts by severity |
| `scannedAt` | String | |

### `coa-analytics-pageviews`

PK: `pvId` · GSI: `repoId-timestamp-index`

Tracks web analytics page views collected via `POST /api/analytics/collect`.

### `coa-analytics-sessions`

PK: `sessionId` · GSI: `repoId-lastSeenAt-index`

Tracks unique visitor sessions.

### `coa-api-logs`

PK: `logId` · GSI: `userId-timestamp-index`

| Attribute | Type | Notes |
|---|---|---|
| `logId` | String | UUID |
| `userId` | String | |
| `method` | String | HTTP method |
| `path` | String | API route path |
| `userAgent` | String | |
| `timestamp` | String | ISO timestamp |

Populated automatically by the middleware for every authenticated API call. View via `GET /api/logs`.

---

## API Reference

All protected routes require a valid session cookie (`coa_session`). The middleware injects `x-user-id` into the request headers.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/github` | Public | Redirect to GitHub OAuth |
| `GET` | `/api/auth/callback` | Public | Handle GitHub OAuth callback, set session |
| `GET` | `/api/auth/me` | Cookie | Return current user info |
| `POST` | `/api/auth/signout` | Cookie | Clear session cookie |

### Repositories

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/repos` | ✅ | List repos for current user |
| `POST` | `/api/repos/connect` | ✅ | Connect a GitHub repo |
| `POST` | `/api/repos/ingest` | ✅ | Re-ingest file snapshot |
| `GET` | `/api/repos/[id]/branches` | ✅ | List branches via GitHub API |
| `GET` | `/api/repos/[id]/pulls` | ✅ | List PRs via GitHub API |
| `GET` | `/api/repos/[id]/analysis` | ✅ | Get latest codebase analysis |
| `POST` | `/api/repos/[id]/analysis` | ✅ | Run new codebase analysis |
| `GET` | `/api/repos/[id]/github-analytics` | ✅ | Get commit activity, contributors, hot files |

### Onboarding & Guides

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/onboarding/create` | ✅ | Create onboarding + trigger guide generation |
| `GET` | `/api/onboarding/[id]` | ✅ | Get onboarding + guide |
| `PUT` | `/api/onboarding/[id]` | ✅ | Update status or first PR timestamp |
| `POST` | `/api/guide/generate` | ✅ | Trigger guide generation |
| `POST` | `/api/guide/refresh` | ✅ | Re-ingest + regenerate guide |

### Chat

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | ✅ | Send message, stream AI response (SSE) |
| `GET` | `/api/chat/history` | ✅ | Get conversation history |

### Security

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/security` | ✅ | Run security scan on connected repo |
| `GET` | `/api/security` | ✅ | Get latest scan result |

### Events & Alert Rules

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | ✅ | List events (with stats) |
| `POST` | `/api/events/ingest` | API key | Ingest browser/app events |
| `POST` | `/api/events/analyze` | ✅ | Run AI analysis on an event |
| `GET` | `/api/alert-rules?repoId=` | ✅ | List alert rules for a repo |
| `POST` | `/api/alert-rules` | ✅ | Create alert rule |
| `PATCH` | `/api/alert-rules/[id]` | ✅ | Update rule (enable/disable, threshold) |
| `DELETE` | `/api/alert-rules/[id]` | ✅ | Delete rule |

### Analytics

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | ✅ | Web analytics summary |
| `POST` | `/api/analytics/collect` | Public | Collect page view |
| `GET` | `/api/analytics/realtime` | ✅ | SSE stream for live visitor count |

### Settings & Logs

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/settings/account` | ✅ | Get account info |
| `PUT` | `/api/settings/account` | ✅ | Update name |
| `GET` | `/api/settings/api-key` | ✅ | Get API key (creates if none) |
| `POST` | `/api/settings/api-key/regenerate` | ✅ | Regenerate API key |
| `GET` | `/api/logs` | ✅ | Get API usage logs |

### CLI & Webhooks

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/cli/sync` | API key | Receive CLI sync payload |
| `POST` | `/api/webhooks/github` | Webhook secret | GitHub push → refresh guide |

---

## Authentication Flow

```
1. User visits /sign-up
   → Fills email + password
   → Cognito creates account, sends verification email

2. User verifies email
   → Cognito marks account as CONFIRMED

3. User visits /sign-in
   → Amplify Auth.signIn() exchanges credentials for JWT
   → Access token + ID token stored in Cognito-managed cookies

4. Authenticated request to API route
   → Middleware reads JWT from cookie
   → Validates against Cognito JWKS endpoint
   → Attaches userId to request context

5. Token refresh
   → Amplify handles automatically via refresh token
   → Refresh token valid for 30 days (configurable in Cognito)
```

```typescript
// middleware.ts — protecting routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('amplify-auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/repos/:path*', '/api/onboarding/:path*', '/api/guide/:path*', '/api/chat'],
};
```

---

## CLI

The `onboardai` CLI runs in any project directory and syncs progress to your dashboard.

### Install

```bash
npm install -g onboardai
```

Or run one-off without installing:

```bash
npx onboardai <command>
```

### Commands

| Command | Description |
|---|---|
| `onboardai init` | Environment setup wizard — installs deps, copies `.env.local`, adds pre-commit hook |
| `onboardai security` | Scan for hardcoded secrets, unsafe patterns, and npm vulnerabilities |
| `onboardai status` | Health check — Node version, dependencies, env vars, open ports, git state |
| `onboardai fix` | Auto-fix common issues (vulnerabilities, missing env keys, blocked ports) |
| `onboardai monitor` | Stream live web events to terminal, optionally with AI analysis |
| `onboardai sync` | Push project progress to your OnboardAI dashboard |
| `onboardai report` | Generate a progress report, optionally email it |
| `onboardai share` | Copy a shareable context summary to clipboard |

### Quick start

```bash
# 1. Install the CLI
npm install -g onboardai

# 2. Set up your project
onboardai init

# 3. Run a security scan
onboardai security

# 4. Sync progress to your dashboard (get your API key from Settings → API)
onboardai sync --api-key coa_YOUR_KEY_HERE
```

After the first sync with `--api-key`, the key is saved to `~/.onboardai/config.json` and future syncs require no flags:

```bash
onboardai sync
```

### Pointing at a local instance

By default the CLI syncs to your deployed dashboard. To point at a local dev server:

```bash
# Save once — all future syncs use localhost
onboardai sync --api-key coa_YOUR_KEY --api-url http://localhost:3000
```

Or edit `~/.onboardai/config.json` directly:

```json
{
  "apiKey": "coa_YOUR_KEY",
  "apiUrl": "http://localhost:3000"
}
```

### Full CLI docs

See [/docs](/docs) for the complete command reference including flags, JSON output mode, CI integration, and how to publish the CLI to npm.

---

## Roadmap

### v0.1 — MVP (weeks 1–8)
- [x] Project setup — Next.js + Amplify + Cognito + DynamoDB
- [ ] GitHub OAuth connection
- [ ] Repo ingestion pipeline
- [ ] GPT-4o mini guide generation
- [ ] Guide viewer UI
- [ ] Basic chat interface
- [ ] Stripe billing (Starter + Growth plans)

### v0.2 — Polish (weeks 9–12)
- [ ] Auto-refresh via GitHub webhook
- [ ] Starter task suggestions from open GitHub Issues
- [ ] Slack notification when guide is ready
- [ ] First-PR tracking per onboarding
- [ ] Onboarding progress dashboard for managers

### v0.3 — Scale (months 4–6)
- [ ] Multi-repo support (monorepo awareness)
- [ ] Architecture diagram generation (Mermaid)
- [ ] Onboarding analytics — time-to-first-PR trends
- [ ] SSO / SAML (Scale plan)
- [ ] GitLab support

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please follow the existing code style and include tests for new API routes.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  Built as part of the DevEx Intelligence platform · Level 2 of 5
</div>
