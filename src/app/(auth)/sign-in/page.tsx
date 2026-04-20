import type { Metadata } from "next"
import { GitBranch, ArrowRight, Lock, Zap } from "lucide-react"

export const metadata: Metadata = { title: "Sign in — Codebase Onboarding" }

const TRUST_ITEMS = [
  { icon: Lock, label: "SOC 2 Type II" },
  { icon: Zap, label: "Setup in 2 minutes" },
  { icon: GitBranch, label: "GitHub OAuth" },
]

const FEATURE_PREVIEWS = [
  { emoji: "🧠", text: "AI-generated codebase knowledge graph" },
  { emoji: "💬", text: "Natural language Q&A about your repos" },
  { emoji: "🎯", text: "Personalised first-issue recommendations" },
  { emoji: "📋", text: "Dynamic onboarding checklists per role" },
  { emoji: "⚡", text: "First PR guidance in days, not weeks" },
]

export default function SignInPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm leading-relaxed text-foreground-muted">
          Sign in with GitHub to access your onboarding dashboard.
          Your repos and guides are waiting.
        </p>
      </div>

      {/* GitHub sign-in button */}
      <div className="space-y-3">
        <a
          href="/api/auth/github"
          className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_0_3px_oklch(0.59_0.243_264.4_/_0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-3">
            {/* GitHub mark */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-background"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
            </div>
            <span>Continue with GitHub</span>
          </div>

          <ArrowRight className="h-4 w-4 text-foreground-muted transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-foreground-muted">
            What you get access to
          </span>
        </div>
      </div>

      {/* Feature preview list */}
      <div className="space-y-2">
        {FEATURE_PREVIEWS.map(({ emoji, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-lg border border-border bg-background-subtle px-3.5 py-2.5 text-xs text-foreground-muted"
          >
            <span className="text-sm">{emoji}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Auto-signup note */}
      <p className="text-center text-xs text-foreground-muted">
        New to Codebase Onboarding?{" "}
        <span className="font-medium text-primary">
          Your account is created automatically on first sign-in.
        </span>
      </p>
    </div>
  )
}
