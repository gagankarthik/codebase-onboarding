# 🚀 Codebase Onboarding Accelerator

> AI-powered onboarding that reads your GitHub repo and generates a personalised, interactive guide so new engineers ship their first PR in days — not months.

Built with **Next.js · AWS Cognito · DynamoDB · GPT-4o mini · AWS Amplify**

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [AWS Setup](#aws-setup)
  - [DynamoDB](#dynamodb)
  - [Amplify Deployment](#amplify-deployment)
- [GitHub Integration](#github-integration)
- [GPT-4o mini Integration](#gpt-4o-mini-integration)
- [DynamoDB Schema](#dynamodb-schema)
- [API Routes](#api-routes)
- [Authentication Flow](#authentication-flow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **Codebase Onboarding Accelerator** connects to a team's GitHub repository, uses AI to analyse the codebase, and auto-generates a personalised onboarding guide for each new hire. No manual documentation. No stale wikis. Just plug in the repo, fill in a short intake form for the new hire's role, and get a fully structured, interactive Day 1 experience in minutes.

Engineering managers get time back. New hires get productive in days. Senior developers stop being interrupted.

---

## The Problem

| Without this tool | With this tool |
|---|---|
| New hire takes 4–6 weeks to first meaningful PR | First meaningful PR in 3–5 days |
| Senior devs lose 15–20 hrs answering basic questions | Zero interruptions — new hire asks the AI |
| Confluence docs are 18 months out of date | Guide auto-updates on every GitHub push |
| Onboarding is the same for every role | Personalised per role, team, and first sprint |
| Replacing a developer costs $77K+ | Retain talent with a great Day 1 experience |

---

## Key Features

- **Zero-writing onboarding** — connects to GitHub, generates the entire guide automatically
- **Role-based personalisation** — engineering manager fills a short intake form, AI tailors the output
- **Chat with your codebase** — new hire asks "how does auth work?" and gets answers grounded in real code (RAG)
- **Starter task suggestions** — AI surfaces 3 good first issues from open GitHub Issues ranked by difficulty
- **Auto-updates** — guide regenerates on every push to main, so it never goes stale
- **Progress tracking** — track time-to-first-PR per hire and onboarding completion rates
- **Slack notifications** — new hire is notified when their guide is ready; manager is alerted on first PR

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI, server components, API routes |
| Auth | AWS Cognito + Amplify Auth | User sign-up, sign-in, JWT tokens |
| Database | AWS DynamoDB | Repos, onboardings, guides, users |
| AI | OpenAI GPT-4o mini | Guide generation, chat (RAG) |
| File ingestion | GitHub REST API v3 | Repo tree, file contents, PRs, issues |
| Hosting | AWS Amplify | CI/CD, hosting, env management |
| Styling | Tailwind CSS | Utility-first styling |
| Storage | AWS S3 (via Amplify Storage) | Generated guide cache, embeddings |

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

## DynamoDB Schema

### coa-prod-users

| Attribute | Type | Description |
|---|---|---|
| `userId` | String (PK) | Cognito sub (UUID) |
| `email` | String | User email |
| `name` | String | Full name |
| `plan` | String | `starter` \| `growth` \| `scale` |
| `createdAt` | String | ISO timestamp |

### coa-prod-repos

| Attribute | Type | Description |
|---|---|---|
| `repoId` | String (PK) | `{ownerId}#{repoName}` |
| `userId` | String | Owner (Cognito userId) |
| `githubRepoId` | Number | GitHub internal repo ID |
| `fullName` | String | e.g. `acme/backend-api` |
| `accessToken` | String | GitHub OAuth token (encrypted) |
| `fileSnapshot` | String | JSON stringified file tree + contents |
| `lastIngestedAt` | String | ISO timestamp |
| `webhookId` | Number | GitHub webhook ID for this repo |

### coa-prod-onboardings

| Attribute | Type | Description |
|---|---|---|
| `onboardingId` | String (PK) | UUID |
| `repoId` | String (GSI) | Foreign key → repos |
| `newHireName` | String | Display name |
| `newHireEmail` | String | To send guide link |
| `role` | String | e.g. `backend engineer` |
| `team` | String | e.g. `platform` |
| `firstSprintFocus` | String | Free text from intake form |
| `status` | String | `pending` \| `generating` \| `ready` |
| `firstPrAt` | String | ISO — set when first PR merged |
| `createdAt` | String | ISO timestamp |

### coa-prod-guides

| Attribute | Type | Description |
|---|---|---|
| `guideId` | String (PK) | UUID |
| `onboardingId` | String (GSI) | Foreign key → onboardings |
| `architectureOverview` | String | AI-generated overview |
| `keyModules` | List | Array of module objects |
| `codingConventions` | List | Array of strings |
| `setupSteps` | List | Array of strings |
| `starterTasks` | List | Array of task objects |
| `firstWeekFocus` | String | Personalised focus summary |
| `generatedAt` | String | ISO timestamp |
| `version` | Number | Increments on each refresh |

### coa-prod-messages

| Attribute | Type | Description |
|---|---|---|
| `messageId` | String (PK) | UUID |
| `onboardingId` | String (GSI) | Foreign key → onboardings |
| `role` | String | `user` \| `assistant` |
| `content` | String | Message text |
| `createdAt` | String | ISO timestamp |

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/repos` | ✅ Required | List connected repos for current user |
| `POST` | `/api/repos/connect` | ✅ Required | Handle GitHub OAuth callback |
| `POST` | `/api/repos/ingest` | ✅ Required | Ingest repo file tree into DynamoDB |
| `POST` | `/api/onboarding/create` | ✅ Required | Create new onboarding + trigger guide gen |
| `GET` | `/api/onboarding/[id]` | ✅ Required | Get onboarding + guide data |
| `PUT` | `/api/onboarding/[id]` | ✅ Required | Update onboarding status |
| `POST` | `/api/guide/generate` | ✅ Required | Trigger / re-trigger guide generation |
| `POST` | `/api/guide/refresh` | ✅ Required | Refresh guide from latest repo snapshot |
| `POST` | `/api/chat` | ✅ Required | Send chat message, receive streaming response |
| `POST` | `/api/webhooks/github` | 🔐 Webhook secret | GitHub push webhook → refresh guide |

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
