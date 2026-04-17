import type { Metadata } from "next"
import Link from "next/link"
import { GitBranch } from "lucide-react"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage() {
  const authUrl = `/api/auth/github`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Sign in with your GitHub account to continue
        </p>
      </div>

      <a
        href={authUrl}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background-muted"
      >
        <GitBranch className="h-4 w-4" />
        Continue with GitHub
      </a>

      <p className="text-center text-xs text-foreground-muted">
        By continuing you agree to our{" "}
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
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
