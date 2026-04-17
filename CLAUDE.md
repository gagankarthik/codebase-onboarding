@AGENTS.md
# Claude Code — Master Build Prompt
# Codebase Onboarding Accelerator

Paste this entire prompt into Claude Code at the start of a new session.
It is a complete specification — read it fully before writing a single file.

---

## MISSION

Build the complete **Codebase Onboarding Accelerator** web application from scratch.
This is a production-quality SaaS product. Every screen must feel like it was
designed by a senior product designer and engineered by a senior full-stack developer.
No placeholder text. No skeleton UIs left unfinished. No AI-generated-looking layouts.

---

## TECH STACK — DO NOT DEVIATE

- **Next.js 14** — App Router only. No Pages Router.
- **TypeScript** — strict mode. No `any`. No `as unknown`.
- **shadcn/ui** — primary component library. Install via `npx shadcn@latest add`.
- **Tailwind CSS** — utility classes only. No inline styles except for CSS variables.
- **AWS Cognito** — auth via `aws-amplify` v6 (`@aws-amplify/auth`).
- **AWS DynamoDB** — via `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`.
- **OpenAI** — via `openai` SDK, model `gpt-4o-mini`.
- **GitHub REST API** — via `@octokit/rest`.
- **Framer Motion** — for all animations and page transitions.
- **Lucide React** — all icons. No other icon library.
- **next-themes** — dark/light mode support.
- **Zod** — all form validation and API input validation.
- **React Hook Form** — all forms, paired with Zod resolvers.

---

## DESIGN SYSTEM — READ THIS BEFORE WRITING ANY CSS

### Color Palette

Use this exact palette. Apply it via CSS variables in `globals.css` and reference
through Tailwind. The palette uses **triadic color theory** — a deep indigo primary,
warm amber accent, and clean slate neutrals. It feels modern, trustworthy, and
technical — like Linear or Vercel, not a generic SaaS template.

```css
/* globals.css */
@layer base {
  :root {
    /* Backgrounds */
    --background: 0 0% 100%;
    --background-subtle: 220 14% 98%;
    --background-muted: 220 13% 95%;

    /* Foregrounds */
    --foreground: 222 47% 11%;
    --foreground-muted: 215 16% 47%;
    --foreground-subtle: 215 14% 65%;

    /* Primary — Deep Indigo */
    --primary: 243 75% 59%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 243 75% 52%;
    --primary-subtle: 243 100% 97%;
    --primary-muted: 243 87% 94%;

    /* Accent — Warm Amber */
    --accent: 37 91% 55%;
    --accent-foreground: 30 47% 15%;
    --accent-subtle: 45 100% 96%;
    --accent-muted: 42 100% 88%;

    /* Success — Emerald */
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --success-subtle: 152 81% 96%;
    --success-muted: 149 80% 90%;

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --destructive-subtle: 0 86% 97%;

    /* Warning */
    --warning: 37 91% 55%;
    --warning-foreground: 30 47% 15%;
    --warning-subtle: 45 100% 96%;

    /* Border & Ring */
    --border: 220 13% 91%;
    --border-strong: 220 13% 82%;
    --input: 220 13% 91%;
    --ring: 243 75% 59%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Radius */
    --radius: 0.625rem;

    /* Sidebar */
    --sidebar: 222 47% 11%;
    --sidebar-foreground: 215 14% 75%;
    --sidebar-accent: 243 75% 59%;
    --sidebar-border: 222 39% 18%;

    /* Code blocks */
    --code-bg: 220 14% 96%;
    --code-foreground: 222 47% 11%;
  }

  .dark {
    --background: 222 47% 8%;
    --background-subtle: 222 47% 10%;
    --background-muted: 222 39% 14%;

    --foreground: 210 40% 98%;
    --foreground-muted: 215 20% 65%;
    --foreground-subtle: 215 16% 47%;

    --primary: 243 75% 65%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 243 75% 72%;
    --primary-subtle: 243 50% 15%;
    --primary-muted: 243 50% 20%;

    --accent: 37 91% 55%;
    --accent-foreground: 30 47% 10%;
    --accent-subtle: 37 50% 12%;
    --accent-muted: 37 50% 18%;

    --success: 160 84% 45%;
    --success-foreground: 0 0% 100%;
    --success-subtle: 160 50% 10%;
    --success-muted: 160 50% 16%;

    --destructive: 0 63% 55%;
    --destructive-foreground: 0 0% 100%;
    --destructive-subtle: 0 50% 12%;

    --warning: 37 91% 55%;
    --warning-foreground: 30 47% 10%;
    --warning-subtle: 37 50% 12%;

    --border: 222 39% 18%;
    --border-strong: 222 39% 24%;
    --input: 222 39% 18%;
    --ring: 243 75% 65%;

    --card: 222 47% 10%;
    --card-foreground: 210 40% 98%;

    --sidebar: 222 47% 6%;
    --sidebar-foreground: 215 14% 65%;
    --sidebar-accent: 243 75% 65%;
    --sidebar-border: 222 39% 14%;

    --code-bg: 222 39% 12%;
    --code-foreground: 210 40% 92%;
  }
}
```

### Typography Rules

- **Font**: `Inter` for UI. `JetBrains Mono` for code. Load via `next/font`.
- **Scale**: Use Tailwind's default type scale. No custom sizes.
- **Headings**: `font-semibold` for page titles, `font-medium` for section labels.
- **Body**: `text-sm` is the default. `text-xs` for metadata. Never below `text-xs`.
- **Line height**: `leading-relaxed` for body copy. `leading-tight` for headings.
- **Letter spacing**: `tracking-tight` on headings above `text-2xl`.

### Spacing Rules

- Use a **4px base grid**. All spacing uses multiples of 4.
- Page content max width: `max-w-7xl` with `px-6` on desktop, `px-4` on mobile.
- Dashboard content area: `max-w-5xl`.
- Cards: `p-6` standard, `p-4` compact.
- Section gaps: `space-y-8` between major sections, `space-y-4` within sections.

### Component Style Rules

**Cards**: Subtle shadow, `rounded-xl`, `border border-border`. On hover: subtle
shadow lift with `transition-shadow`. Never use heavy drop shadows.

**Buttons**: Primary uses `--primary` background. Ghost buttons are subtle.
Destructive actions always require confirmation. All buttons have `font-medium`.

**Inputs**: Clean, minimal. Focus ring uses `--ring`. Error state uses `--destructive`.
Always show label above input, never placeholder-as-label.

**Badges**: Rounded pill. Use semantic colors — success for ready states,
warning for pending, primary for default.

**Sidebar**: Dark sidebar (`--sidebar` background) with light text. Active items
highlighted with a left accent border in `--primary`. Icon + label layout.

### Animation Rules (Framer Motion)

Use these exact variants throughout. Consistency is key — it makes the app feel
crafted, not assembled.

```typescript
// lib/animations.ts — create this file
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}
```

Use `motion.div` with `variants` prop and `staggerContainer` on list parents.
Every page should animate in. Cards should stagger in one by one.

---

## INSTALLATION COMMANDS

Run these in order before writing any application code:

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# shadcn/ui init
npx shadcn@latest init
# When asked: Style=Default, Base color=Slate, CSS variables=yes

# shadcn components — install ALL of these
npx shadcn@latest add button card badge input label textarea select
npx shadcn@latest add dialog drawer sheet popover dropdown-menu
npx shadcn@latest add toast toaster sonner
npx shadcn@latest add avatar separator skeleton progress
npx shadcn@latest add tabs accordion collapsible
npx shadcn@latest add table command tooltip
npx shadcn@latest add form
npx shadcn@latest add alert alert-dialog

# Additional packages
npm install framer-motion lucide-react next-themes
npm install @aws-amplify/auth aws-amplify
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install openai @octokit/rest
npm install react-hook-form @hookform/resolvers zod
npm install jose        # JWT verification
npm install uuid @types/uuid
npm install @types/node
```

---

## FILE-BY-FILE BUILD SPECIFICATION

Build every file below. Do not skip any. Do not use placeholder comments like
`// TODO: implement`. Every function must be fully implemented.

---

### FOUNDATION FILES

#### `app/globals.css`
- Full CSS variables as specified above in the design system section
- Import Inter and JetBrains Mono
- Base reset and typography
- Custom scrollbar styles (thin, matches border color)
- Smooth scroll behavior

#### `lib/animations.ts`
All Framer Motion variants as specified above.

#### `lib/utils.ts`
- `cn()` from shadcn (already there from init)
- `formatRelativeTime(date: string): string` — "2 hours ago", "3 days ago"
- `formatDate(date: string): string` — "Apr 17, 2026"
- `truncate(str: string, maxLength: number): string`
- `generateId(): string` — wraps `uuid`
- `getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string` — returns Tailwind class

#### `types/index.ts`
Export all shared TypeScript interfaces:

```typescript
export interface User {
  userId: string
  email: string
  name: string
  plan: 'starter' | 'growth' | 'scale'
  createdAt: string
}

export interface Repo {
  repoId: string
  userId: string
  githubRepoId: number
  fullName: string        // "acme/backend-api"
  description?: string
  language?: string
  stars?: number
  lastIngestedAt?: string
  webhookId?: number
  createdAt: string
}

export interface Onboarding {
  onboardingId: string
  repoId: string
  newHireName: string
  newHireEmail: string
  role: string
  team: string
  firstSprintFocus: string
  status: 'pending' | 'generating' | 'ready' | 'error'
  firstPrAt?: string
  createdAt: string
}

export interface GuideModule {
  name: string
  path: string
  purpose: string
  relevantForRole: boolean
}

export interface StarterTask {
  issueNumber: number
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  why: string
  url: string
}

export interface Guide {
  guideId: string
  onboardingId: string
  architectureOverview: string
  keyModules: GuideModule[]
  codingConventions: string[]
  setupSteps: string[]
  starterTasks: StarterTask[]
  firstWeekFocus: string
  generatedAt: string
  version: number
}

export interface ChatMessage {
  messageId: string
  onboardingId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
```

---

### AUTH LAYER

#### `lib/auth/cognito.ts`

```typescript
// Full implementation required:
// - configureAmplify() — call once at app root
// - signUp(email, password, name) — returns Cognito result
// - confirmSignUp(email, code) — email verification
// - signIn(email, password) — returns tokens
// - signOut() — clear session
// - getCurrentUser() — returns User or null
// - getAccessToken() — returns JWT string or null
// - isAuthenticated() — returns boolean
```

Configure Amplify with values from env vars. Use `@aws-amplify/auth` v6 API
(`signIn`, `signUp`, `signOut`, `fetchAuthSession`, `getCurrentUser`).

#### `middleware.ts` (root level)

Protect all dashboard and API routes. Redirect unauthenticated users to `/sign-in`.
Validate JWT against Cognito JWKS. Attach `userId` to request headers for API routes.

Use `jose` library to verify the JWT locally (don't call Cognito on every request).
Cache the JWKS for 1 hour using a module-level Map.

---

### DATABASE LAYER

#### `lib/db/client.ts`
DynamoDB DocumentClient singleton. Read credentials from env vars.

#### `lib/db/users.ts`
- `createUser(user: Omit<User, 'createdAt'>): Promise<User>`
- `getUserById(userId: string): Promise<User | null>`
- `updateUserPlan(userId: string, plan: User['plan']): Promise<void>`

#### `lib/db/repos.ts`
- `createRepo(repo: Omit<Repo, 'createdAt'>): Promise<Repo>`
- `getRepoById(repoId: string): Promise<Repo | null>`
- `getReposByUserId(userId: string): Promise<Repo[]>`
- `updateRepo(repoId: string, updates: Partial<Repo>): Promise<void>`
- `deleteRepo(repoId: string): Promise<void>`

#### `lib/db/onboardings.ts`
- `createOnboarding(data: Omit<Onboarding, 'onboardingId' | 'createdAt'>): Promise<Onboarding>`
- `getOnboardingById(onboardingId: string): Promise<Onboarding | null>`
- `getOnboardingsByRepoId(repoId: string): Promise<Onboarding[]>`
- `updateOnboardingStatus(onboardingId: string, status: Onboarding['status']): Promise<void>`
- `markFirstPR(onboardingId: string): Promise<void>`

#### `lib/db/guides.ts`
- `createGuide(data: Omit<Guide, 'guideId' | 'generatedAt' | 'version'>): Promise<Guide>`
- `getGuideByOnboardingId(onboardingId: string): Promise<Guide | null>`
- `updateGuide(guideId: string, data: Partial<Guide>): Promise<void>`

#### `lib/db/messages.ts`
- `createMessage(data: Omit<ChatMessage, 'messageId' | 'createdAt'>): Promise<ChatMessage>`
- `getMessagesByOnboardingId(onboardingId: string): Promise<ChatMessage[]>`

---

### GITHUB LAYER

#### `lib/github/client.ts`
- `getGitHubClient(accessToken: string): Octokit`
- `exchangeCodeForToken(code: string): Promise<string>` — calls GitHub OAuth token endpoint

#### `lib/github/ingest.ts`
- `ingestRepo(accessToken: string, fullName: string): Promise<RepoSnapshot>`

The ingest process:
1. Fetch repo metadata (description, language, stars, default branch)
2. Get file tree recursively (use git/trees API with recursive=1)
3. Filter out: `node_modules`, `dist`, `build`, `.next`, `*.lock`, `*.min.js`,
   `*.min.css`, images, fonts, `.git`, `coverage`
4. Prioritise: `README*`, entry points (`index.*`, `main.*`, `app.*`, `server.*`),
   config files (`*.config.*`, `.env.example`), and the 20 most recently modified files
5. Read content of top 60 files maximum (prevent token overflow)
6. Return `{ tree: string[], files: { path: string, content: string }[], metadata: RepoMetadata }`

#### `lib/github/issues.ts`
- `getOpenIssues(accessToken: string, fullName: string): Promise<GitHubIssue[]>`
  Fetch up to 30 open issues labelled `good first issue` or `help wanted`.

---

### OPENAI LAYER

#### `lib/openai/client.ts`
OpenAI client singleton. Read API key from `process.env.OPENAI_API_KEY`.

#### `lib/openai/generateGuide.ts`

```typescript
export async function generateGuide(params: {
  repoSnapshot: RepoSnapshot
  onboarding: Onboarding
  openIssues: GitHubIssue[]
}): Promise<Omit<Guide, 'guideId' | 'onboardingId' | 'generatedAt' | 'version'>>
```

Build a detailed system prompt that includes:
- The repo file tree as a directory listing
- Key file contents (truncated to fit within 100K tokens total)
- The new hire's role, team, and first sprint focus
- Open issues list

Request a structured JSON response matching the Guide schema.
Parse and validate with Zod. Retry once on parse failure.

Use `gpt-4o-mini` with `response_format: { type: 'json_object' }`.
Set `max_tokens: 4000`.

#### `lib/openai/chat.ts`

```typescript
export async function streamChat(params: {
  question: string
  repoSnapshot: RepoSnapshot
  conversationHistory: ChatMessage[]
}): Promise<ReadableStream>
```

Simple keyword-based retrieval: score each file by how many words from the
question appear in the file path or content. Take top 4 files.

Return a streaming response using `openai.chat.completions.create({ stream: true })`.

---

### API ROUTES

#### `app/api/repos/route.ts` — GET
Return all repos for the authenticated user.
Read `userId` from request headers (set by middleware).

#### `app/api/repos/connect/route.ts` — GET
GitHub OAuth callback handler:
1. Extract `code` from query params
2. Exchange for access token
3. Fetch GitHub user profile
4. Create or update repo record in DynamoDB
5. Trigger repo ingestion (async — don't wait)
6. Redirect to `/dashboard`

#### `app/api/repos/ingest/route.ts` — POST
Body: `{ repoId: string }`
1. Fetch repo from DynamoDB
2. Run `ingestRepo()`
3. Store file snapshot in DynamoDB
4. Trigger guide regeneration for all active onboardings of this repo
5. Return `{ success: true }`

#### `app/api/onboarding/create/route.ts` — POST
Zod validate body: `{ repoId, newHireName, newHireEmail, role, team, firstSprintFocus }`.
1. Create onboarding record with `status: 'pending'`
2. Trigger guide generation (set status to `'generating'`)
3. Run guide generation (can be long — use streaming or background)
4. On success: set status to `'ready'`
5. Return the created onboarding

#### `app/api/onboarding/[id]/route.ts` — GET, PUT
GET: Return onboarding + guide + message count.
PUT: Update status or `firstPrAt`.

#### `app/api/guide/generate/route.ts` — POST
Body: `{ onboardingId: string }`
Full guide generation pipeline. Returns `{ guide }` on success.

#### `app/api/guide/refresh/route.ts` — POST
Body: `{ onboardingId: string }`
Re-ingest repo, re-generate guide, increment version. Returns `{ guide }`.

#### `app/api/chat/route.ts` — POST
Body: `{ onboardingId: string, message: string }`
1. Load onboarding + repo snapshot from DynamoDB
2. Load conversation history (last 10 messages)
3. Save user message to DynamoDB
4. Stream AI response back using `Response` with a `ReadableStream`
5. After stream completes, save assistant message to DynamoDB

Use Next.js streaming:
```typescript
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
})
```

#### `app/api/webhooks/github/route.ts` — POST
1. Verify `x-hub-signature-256` header using HMAC-SHA256
2. Parse push event
3. Find repo by `githubRepoId`
4. Trigger background re-ingestion + guide refresh
5. Return `{ received: true }` immediately (don't await the background work)

---

### PAGES — FULL IMPLEMENTATIONS REQUIRED

---

#### `app/layout.tsx`
- Configure Amplify auth on the client side
- Wrap with `ThemeProvider` (next-themes)
- Load Inter and JetBrains Mono via `next/font`
- Add `Toaster` (Sonner) for notifications
- Dark mode class strategy: `class`

---

#### `app/(auth)/layout.tsx`

A split-screen layout:
- **Left half** (hidden on mobile): Deep indigo gradient background
  (`from-[hsl(243,75%,30%)] to-[hsl(243,75%,15%)]`). Contains:
  - App logo top-left
  - Central testimonial quote in large italic serif text, white, with attribution
  - Bottom row of 3 small social proof stats (e.g. "200+ teams", "4.2 days avg to first PR", "80% faster onboarding")
- **Right half**: White/dark card, centered vertically and horizontally, contains the auth form

---

#### `app/(auth)/sign-in/page.tsx`

Full sign-in form using React Hook Form + Zod:
- Email field with validation
- Password field with show/hide toggle (Eye/EyeOff Lucide icons)
- "Forgot password?" link (right-aligned, small)
- "Sign in" primary button (full width, shows loading spinner on submit)
- Divider line with "or" text
- "Continue with GitHub" button (uses GitHub icon from Lucide, ghost variant)
- Link to sign-up page at bottom

On success: redirect to `/dashboard`.
On error: show specific error message via Sonner toast.

---

#### `app/(auth)/sign-up/page.tsx`

Full sign-up form:
- Full name field
- Email field
- Password field with strength indicator bar (4 levels: weak/fair/good/strong)
  Calculate strength based on: length ≥ 8, has uppercase, has number, has special char
- Confirm password field
- Terms checkbox (required)
- "Create account" primary button (full width, loading state)
- Link to sign-in at bottom

After sign-up: show email verification step inline (replace form with a
6-digit code input component — each digit in its own input box, auto-focus
next on input, auto-submit on last digit).

---

#### `app/(dashboard)/layout.tsx`

Sidebar layout. The sidebar must be:
- **280px wide** on desktop, collapsible to icon-only (64px) via a toggle button
- **Full-height**, sticky, dark background (`--sidebar`)
- **Top section**: Logo + app name, with a collapse toggle button
- **Navigation items** (with icons):
  - Dashboard (LayoutDashboard icon)
  - Repositories (GitBranch icon)
  - Onboardings (Users icon)
  - Settings (Settings icon)
- Active item: left accent border in `--primary`, slightly lighter background
- **Bottom section**: User avatar, name, email, and a "Sign out" button
- On mobile: sidebar becomes a sheet (drawer from bottom or slide-in from left)

Main content area: scrollable, has top header bar with:
- Page title (set via a context or layout props)
- Breadcrumbs
- Dark/light mode toggle button
- Notification bell (placeholder)

---

#### `app/(dashboard)/dashboard/page.tsx`

**Hero stats row** (4 cards, animate in with stagger):
- Total repos connected
- Total onboardings created
- Average days to first PR (computed from `firstPrAt` vs `createdAt`)
- Onboardings in progress (status = generating or pending)

Each stat card: large number, subtle label below, small trend indicator (↑ or ↓ with %).
Use `--primary-subtle` background for the primary metric card.

**Recent Onboardings section**:
A table-style list showing the last 8 onboardings across all repos.
Columns: Name + avatar initials, Role, Repo, Status badge, Created date, First PR date.
Click row → navigate to onboarding detail.

**Connected Repos section**:
A 2-column grid of repo cards (3-column on xl screens).
Each card shows: repo name + org, language badge (colour-coded by language),
star count, last ingested time, and a "New Onboarding" button.
Empty state: a large centered CTA to connect first repo, with a GitHub icon and button.

**Quick actions** bar (top right of page):
- "Connect repo" button (primary)
- "New onboarding" button (secondary, disabled if no repos connected)

---

#### `app/(dashboard)/repos/[repoId]/page.tsx`

**Repo header**: Full repo name in large text, description, language chip,
star count, last synced time, "Sync now" button that triggers re-ingestion.

**Onboarding list** for this repo:
Full table with sortable columns (name, role, status, days to first PR).
Status badges: `pending` (yellow), `generating` (blue, animated pulse), `ready` (green).
Row click → onboarding detail.

**"New Onboarding" button** → opens a Sheet (right side drawer) containing
the intake form. Do not navigate away — keep the repo page visible underneath.

**Intake form fields** (in the Sheet):
- New hire full name (required)
- New hire work email (required, validated)
- Role — free text with suggestions (autocomplete dropdown): Backend Engineer,
  Frontend Engineer, Full Stack Engineer, DevOps Engineer, Data Engineer, Mobile Engineer
- Team — free text
- First sprint focus — textarea, "What will they be working on in their first sprint?"
- Submit triggers POST `/api/onboarding/create`, closes sheet, shows toast,
  adds new row to list with `generating` status

---

#### `app/(dashboard)/onboarding/[onboardingId]/page.tsx`

This is the **core product screen**. The guide viewer.
It must look like a premium documentation tool — think Notion meets Linear meets Vercel docs.

**Layout**: Two-column on desktop. Left column (65%) = guide content. Right column (35%) = sidebar with chat preview and quick stats.

**Guide header**:
- New hire's name in large text with avatar initials circle
- Role badge + Team badge
- "Guide last updated" timestamp with a refresh icon button
- Status indicator (ready = green dot, generating = pulsing blue dot)
- Version number (`v3` style badge)

**Guide sections** (each is a collapsible accordion panel, open by default):

1. **Architecture Overview** — rendered as formatted prose. Use a slightly different
   background (`--background-subtle`) to distinguish from the card. Add a small
   building/layout icon in the section header.

2. **Key Modules** — a grid of module cards (2-column). Each card:
   - Module name (monospace font)
   - File path in small muted monospace text
   - Purpose description
   - A "Relevant for your role" badge if `relevantForRole === true`
   - Hover: subtle border highlight in `--primary`

3. **Coding Conventions** — a numbered list. Each item has a checkmark icon
   on the left in `--success`. Clean, well-spaced.

4. **Setup Steps** — a visual step-by-step list. Each step has a numbered circle
   (filled `--primary`), the instruction text, and a subtle connecting line between steps.

5. **Your First Week** — a highlighted callout box with a calendar icon.
   `--accent-subtle` background. The personalised focus text in slightly larger body copy.

6. **Starter Tasks** — 3 cards in a row (or stack on mobile). Each task card:
   - Issue number (`#42`) in muted monospace
   - Issue title in semibold
   - Difficulty badge: `easy` = green, `medium` = amber, `hard` = red
   - "Why this task?" text in small muted text
   - "Open on GitHub" button that links to the issue (external link icon)

**Loading / Generating state**:
When status is `generating`, show the guide skeleton with animated shimmer
and a prominent banner: "✨ AI is reading your codebase — guide ready in ~60 seconds"
with an animated progress bar that fills over 60 seconds.

**Right sidebar** (desktop only):
- Mini chat input box with "Ask about this codebase →" label, clicking expands to full chat view
- Quick stats: "Time since onboarding", "PRs merged", "Guide version"
- "Share guide" button (copies link to clipboard)

---

#### `app/(dashboard)/onboarding/[onboardingId]/chat/page.tsx`

Full-page chat interface. This must feel like a premium AI chat product.

**Layout**: Single column, full height viewport minus the top nav. Chat messages fill the scrollable area. Input pinned to bottom.

**Header**: 
- Back button to guide view
- "Chatting with [repo name]" title
- Subtitle: "Powered by GPT-4o mini · Context: [repo name] codebase"
- A small connected green dot

**Message list**:
- User messages: right-aligned, `--primary` background, white text, rounded-2xl with slightly less rounding on bottom-right
- Assistant messages: left-aligned, `--card` background, `--border` border, rounded-2xl with slightly less rounding on bottom-left
- Each message: small timestamp below
- Assistant messages that contain code: render code blocks with syntax highlighting (use a simple `<pre>` with `--code-bg` background and monospace font)
- File paths mentioned by AI: render as inline `code` chips with `--code-bg`
- **Typing indicator**: three animated dots when AI is generating (show as an assistant message bubble)
- Animate new messages in with `slideInRight`

**Suggested questions** (shown only when conversation is empty, as a grid of chips):
- "How does authentication work in this codebase?"
- "What's the database schema?"
- "How do I run the tests locally?"
- "What are the main API endpoints?"
- "How is the project structured?"
- "What coding conventions does the team use?"

**Input area**:
- Full-width textarea (auto-resize, max 5 lines)
- Send button (right side, disabled when empty or loading)
- Keyboard shortcut hint: "Enter to send · Shift+Enter for new line"
- Character count when over 200 chars

---

#### `app/(dashboard)/settings/page.tsx`

Tabbed settings page (use shadcn Tabs component):

**Tab 1 — Account**:
- Profile card: avatar with upload placeholder, name and email fields
- "Save changes" button
- Danger zone: "Delete account" button (opens confirmation dialog)

**Tab 2 — Plan & Billing**:
Three pricing cards in a row:
- **Starter** ($49/mo): 1 repo, 5 seats, on-demand guide refresh
- **Growth** ($99/mo, highlighted as current/recommended): 3 repos, 20 seats, auto-refresh, Slack notifications, priority support
- **Scale** ($249/mo): unlimited repos and seats, SSO, analytics, custom onboarding checklists
Each card has an "Upgrade" or "Current plan" button.

**Tab 3 — Integrations**:
- GitHub connection status (connected/disconnected with green/red dot)
- Slack integration card (coming soon badge, muted)
- GitLab card (coming soon badge)

**Tab 4 — API**:
- API key display (masked, with copy and regenerate buttons)
- Basic usage stats
- Link to API docs

---

### SHARED COMPONENTS

Build all of these fully — no placeholder implementations.

#### `components/ui/page-header.tsx`
Reusable page header: title, optional subtitle, optional right-side actions slot.

#### `components/ui/empty-state.tsx`
Reusable empty state: icon (Lucide), heading, description, optional CTA button.
Used when repo list is empty, onboarding list is empty, etc.

#### `components/ui/status-badge.tsx`
Wraps shadcn Badge. Accepts `status: 'pending' | 'generating' | 'ready' | 'error'`.
Maps to correct color and label. Generating status shows a subtle pulse animation.

#### `components/ui/loading-spinner.tsx`
A clean circular spinner using a CSS animation. Two sizes: `sm` (16px) and `md` (24px).

#### `components/ui/confirm-dialog.tsx`
Reusable confirmation dialog. Props: `title`, `description`, `confirmLabel`,
`destructive` (boolean), `onConfirm`, `trigger` (React node).

#### `components/auth/amplify-provider.tsx`
Client component that calls `configureAmplify()` on mount. Wrap `app/layout.tsx` body with this.

#### `components/dashboard/repo-card.tsx`
The repo card component as described in the dashboard page spec.
Language colour map (at minimum): TypeScript=blue, JavaScript=yellow, Python=green,
Go=cyan, Rust=orange, Ruby=red, Java=brown, default=gray.

#### `components/guide/generation-progress.tsx`
The "generating" banner with animated progress bar. Takes a `startedAt` timestamp
and animates the bar from 0% to 95% over 60 seconds using `requestAnimationFrame`.
At 95% it stops and waits for the actual completion signal.

#### `components/guide/module-card.tsx`
Module card as described in the guide viewer spec. Accepts a `GuideModule` prop.

#### `components/guide/starter-task-card.tsx`
Starter task card as described. Accepts a `StarterTask` prop.

#### `components/chat/message-bubble.tsx`
Renders a single chat message. Handles code block detection: if the content contains
triple backtick blocks, extract and render them in a styled `<pre>` element with
a copy-to-clipboard button overlay (appears on hover).

#### `components/chat/typing-indicator.tsx`
Three dots that bounce in sequence using Framer Motion, inside a message bubble.

---

## IMPORTANT IMPLEMENTATION RULES

### Never do these things:

1. **No hardcoded dummy data** in production code paths. Use empty states instead.
2. **No `console.log`** statements. Use structured error handling throughout.
3. **No `// TODO` comments** — implement everything fully or omit the feature.
4. **No `any` TypeScript** — every value must be typed.
5. **No inline styles** except when using CSS variables (`style={{ '--custom': value }}`).
6. **No generic button text** like "Click here" or "Submit". All buttons have specific, action-oriented labels.
7. **No generic error messages** — all error toasts explain what went wrong and what to do.
8. **No missing loading states** — every async operation shows a loading indicator.
9. **No missing empty states** — every list or grid shows a helpful empty state when empty.
10. **No placeholder avatars** — use generated initials avatars (first letter of first + last name).

### Always do these things:

1. Every form field has a label and a clear error message.
2. Every destructive action has a confirmation step.
3. Every page has a correct `<title>` via `export const metadata`.
4. Every image has an `alt` attribute.
5. Every interactive element is keyboard accessible.
6. API errors are caught and shown to the user via Sonner toasts.
7. DynamoDB calls are wrapped in try/catch with meaningful error logging.
8. OpenAI calls have a timeout and handle rate limit errors gracefully.
9. Long-running operations (guide generation) show real-time progress feedback.
10. The sidebar navigation shows the active route correctly.

---

## ENVIRONMENT VARIABLES REFERENCE

Create `.env.example` with all these keys (empty values):

```env
# Next.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# AWS Cognito
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=

# AWS DynamoDB
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
DYNAMODB_TABLE_PREFIX=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=
GITHUB_WEBHOOK_SECRET=
```

---

## BUILD ORDER

Follow this exact order to avoid import errors and missing dependencies:

1. Run all install commands
2. Set up `globals.css` with full design system
3. Create `lib/animations.ts`, `lib/utils.ts`, `types/index.ts`
4. Build database layer (`lib/db/*`)
5. Build GitHub layer (`lib/github/*`)
6. Build OpenAI layer (`lib/openai/*`)
7. Build auth layer (`lib/auth/cognito.ts`, `middleware.ts`)
8. Build all API routes
9. Build shared UI components (`components/ui/*`)
10. Build feature components (`components/auth/*`, `components/dashboard/*`, etc.)
11. Build pages in order: layout → auth pages → dashboard pages
12. Create `.env.example`
13. Update `next.config.js` (image domains, env vars)
14. Update `tailwind.config.ts` (add custom CSS variable tokens)

---

## FINAL QUALITY CHECK

Before considering the build complete, verify:

- [ ] All pages render without TypeScript errors
- [ ] All forms validate correctly and show inline errors
- [ ] Auth flow: sign up → verify email → sign in → redirect to dashboard → sign out
- [ ] Repo connection flow: connect GitHub → OAuth → repo appears in dashboard
- [ ] Onboarding flow: open intake form → submit → generating state → ready state
- [ ] Guide viewer: all 6 sections render with data, accordion opens/closes
- [ ] Chat: sends message → streaming response → saves to history → reloads on refresh
- [ ] Dark mode: toggle works, all components look correct in both modes
- [ ] Mobile: sidebar collapses to sheet, all pages are usable on 375px viewport
- [ ] Empty states: show on first load before any data exists
- [ ] Loading states: show on all async operations
- [ ] Error states: API failures show toast notifications

---

## TONE AND COPY

The product copy across the app should feel like it was written by a thoughtful
product designer — not generated by AI. Specific guidelines:

- **Headings**: Short, direct, action-oriented. "Your Repositories" not "Repository Management"
- **Descriptions**: One sentence, specific. "Connect a GitHub repo to generate your first onboarding guide." not "Get started with our platform."
- **Empty states**: Empathetic and helpful. "No repos connected yet — connect your first repo and have a guide ready in minutes."
- **Success messages**: Specific. "Guide generated for Sarah Chen — ready in 47 seconds." not "Success!"
- **Error messages**: Honest and actionable. "GitHub rate limit reached — guide generation will resume in 2 minutes."
- **Buttons**: Verb-first. "Generate guide", "Connect repo", "Start onboarding", "Copy link"
- **Badge labels**: Sentence case. "Ready", "Generating...", "Pending", "Error"

---

This is the complete specification. Build it.