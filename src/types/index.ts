export interface User {
  userId: string
  email: string
  name: string
  plan: "starter" | "growth" | "scale"
  createdAt: string
}

export interface Repo {
  repoId: string
  userId: string
  githubRepoId: number
  fullName: string
  description?: string
  language?: string
  stars?: number
  lastIngestedAt?: string
  webhookId?: number
  branch?: string
  subfolder?: string
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
  status: "pending" | "generating" | "ready" | "error"
  firstPrAt?: string
  createdAt: string
}

export interface GuideModule {
  name: string
  path: string
  purpose: string
  relevantForRole: boolean
  topContributor?: string
  lastUpdated?: string
  whyItMatters?: string
}

export interface StarterTask {
  issueNumber: number
  title: string
  difficulty: "easy" | "medium" | "hard"
  why: string
  url: string
}

export interface ConventionInsight {
  rule: string
  confidence: string
  category: "naming" | "error-handling" | "testing" | "patterns" | "architecture" | "tooling"
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
  tribalKnowledge: ConventionInsight[]
  generatedAt: string
  version: number
}

export type WebEventType = "error" | "warning" | "api_error" | "page_view" | "performance" | "info"

export interface EventAnalysis {
  explanation: string
  rootCause: string
  affectedFile?: string
  affectedLine?: number
  suggestedFix: string
  confidence: "high" | "medium" | "low"
}

export interface WebEvent {
  eventId: string
  repoId: string
  type: WebEventType
  message: string
  stack?: string
  url?: string
  filename?: string
  lineno?: number
  colno?: number
  userAgent?: string
  metadata?: Record<string, string | number | boolean>
  analysis?: EventAnalysis
  analyzedAt?: string
  createdAt: string
}

export interface SecurityFinding {
  file: string
  line: number
  issue: string
  severity: "critical" | "high" | "medium" | "low"
  category: "secret" | "code-pattern" | "dependency" | "env"
}

export interface DependencyVulnerabilities {
  critical: number
  high: number
  moderate: number
  low: number
  total: number
}

export interface SecurityScan {
  scanId: string
  repoId: string
  score: number
  findings: SecurityFinding[]
  dependencyVulnerabilities: DependencyVulnerabilities
  scannedAt: string
}

export interface ChatMessage {
  messageId: string
  onboardingId: string
  role: "user" | "assistant"
  content: string
  citations?: string[]
  createdAt: string
}

export interface RepoMetadata {
  description: string
  language: string
  stars: number
  defaultBranch: string
  fullName: string
}

export interface RepoSnapshot {
  tree: string[]
  files: { path: string; content: string }[]
  metadata: RepoMetadata
}

export interface GitHubIssue {
  number: number
  title: string
  body?: string
  labels: { name: string }[]
  html_url: string
}

export interface OnboardingProgress {
  repoConnected: boolean
  guideGenerated: boolean
  firstBranchCreated: boolean
  firstPrOpened: boolean
}
