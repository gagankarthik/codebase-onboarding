import type { Metadata } from "next"
import Link from "next/link"
import { GitBranch } from "lucide-react"

export const metadata: Metadata = {
  title: "CLI Docs — OnboardAI",
  description: "Get started with the OnboardAI security CLI. Installation, commands, CI integration, and how to publish the CLI to npm.",
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "oklch(0.546 0.243 264.4)" }}
            >
              <GitBranch className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">OnboardAI</span>
            <span className="text-foreground-muted">/</span>
            <span className="text-sm text-foreground-muted">Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-foreground-muted transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
