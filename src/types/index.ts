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
}

export interface StarterTask {
  issueNumber: number
  title: string
  difficulty: "easy" | "medium" | "hard"
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
  role: "user" | "assistant"
  content: string
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
