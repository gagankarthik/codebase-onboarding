export interface User {
  userId: string
  email: string
  name: string
  plan: "starter" | "growth" | "scale"
  apiKey?: string
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

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface PageViewRecord {
  pvId: string
  repoId: string
  sessionId: string
  pathname: string
  referrer?: string
  device: "desktop" | "mobile" | "tablet"
  browser: string
  os: string
  duration?: number
  timestamp: string
}

export interface AnalyticsSession {
  sessionId: string
  repoId: string
  pageCount: number
  startedAt: string
  lastSeenAt: string
}

export interface AnalyticsTimeSeries {
  label: string
  visitors: number
  views: number
}

export interface AnalyticsSummary {
  uniqueVisitors: number
  pageViews: number
  bounceRate: number
  avgDuration: number
  activeVisitors: number
  topPages: { pathname: string; views: number; pct: number }[]
  topReferrers: { referrer: string; visits: number; pct: number }[]
  deviceBreakdown: { label: string; count: number; pct: number }[]
  browserBreakdown: { label: string; count: number; pct: number }[]
  timeSeries: AnalyticsTimeSeries[]
}

// ── Events ────────────────────────────────────────────────────────────────────

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

// ── Codebase Analysis ─────────────────────────────────────────────────────────

export interface DirectoryNode {
  name: string
  path: string
  fileCount: number
  totalLines: number
}

export interface TechStackEntry {
  name: string
  version?: string
  category: "language" | "framework" | "tool" | "database" | "cloud" | "testing"
  confidence: "detected" | "inferred"
}

export interface ComplexityMetrics {
  totalFiles: number
  totalLines: number
  avgFileSizeLines: number
  largestFiles: { path: string; lines: number }[]
  dependencyCount: number
  testFileCount: number
  configFileCount: number
}

export interface CodebaseAnalysis {
  analysisId: string
  repoId: string
  directoryTree: DirectoryNode[]
  techStack: TechStackEntry[]
  complexity: ComplexityMetrics
  entryPoints: string[]
  analyzedAt: string
}

// ── GitHub Repo Analytics ─────────────────────────────────────────────────────

export interface WeeklyCommit {
  week: number     // Unix timestamp of week start
  total: number
  additions: number
  deletions: number
}

export interface ContributorStat {
  login: string
  avatar: string
  totalCommits: number
  additions: number
  deletions: number
  weeksActive: number
}

export interface FileChangeFrequency {
  path: string
  changeCount: number
  lastChanged: string
}

export interface RepoGitHubAnalytics {
  fullName: string
  weeklyCommits: WeeklyCommit[]
  contributors: ContributorStat[]
  mostChangedFiles: FileChangeFrequency[]
  fetchedAt: string
}

// ── Alert Rules ───────────────────────────────────────────────────────────────

export type AlertCondition = "error_count" | "critical_error" | "high_error_rate" | "new_error_type"
export type AlertAction = "log" | "email" | "webhook"

export interface AlertRule {
  ruleId: string
  repoId: string
  name: string
  condition: AlertCondition
  threshold?: number            // e.g. 5 errors per window
  windowMinutes?: number        // rolling window
  action: AlertAction
  actionTarget?: string         // email address or webhook URL
  enabled: boolean
  triggeredCount: number
  lastTriggeredAt?: string
  createdAt: string
}

// ── API Logs ──────────────────────────────────────────────────────────────────

export interface ApiLog {
  logId: string
  userId?: string
  method: string
  path: string
  statusCode?: number
  durationMs?: number
  userAgent?: string
  timestamp: string
}
