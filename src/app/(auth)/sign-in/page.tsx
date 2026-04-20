import type { Metadata } from "next"
import { GitBranch } from "lucide-react"
import Image from "next/image"

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
        <Image src="/GitHub.svg" alt="GitHub logo" className="h-5 w-5"  width={125} height={125}/>
      </a>

    </div>
  )
}
