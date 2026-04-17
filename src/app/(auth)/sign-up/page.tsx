import type { Metadata } from "next"
import Link from "next/link"
import { GitBranch, Zap, Shield, RefreshCw } from "lucide-react"

export const metadata: Metadata = { title: "Create account" }

const PERKS = [
  { icon: Zap, text: "First guide ready in under 60 seconds" },
  { icon: Shield, text: "Read-only GitHub access — we never push code" },
  { icon: RefreshCw, text: "Auto-refreshes when you push to main" },
]

export default function SignUpPage() {
  const authUrl = `/api/auth/github`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Start onboarding engineers faster — no credit card required
        </p>
      </div>

      <a
        href={authUrl}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <GitBranch className="h-4 w-4" />
        Sign up with GitHub
      </a>

      <ul className="space-y-2.5">
        {PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-foreground-muted">
            <Icon className="h-3.5 w-3.5 shrink-0 text-success" />
            {text}
          </li>
        ))}
      </ul>

      <p className="text-center text-xs text-foreground-muted">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
