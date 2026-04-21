import type { Metadata } from "next"
import Link from "next/link"
import { GitBranch, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "CLI Documentation — OnboardAI",
  description:
    "Complete reference for the OnboardAI CLI — security scanning, environment setup, web event monitoring, dashboard sync, and how to publish the CLI to npm.",
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: logo + breadcrumb */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "oklch(0.546 0.243 264.4)" }}
              >
                <GitBranch className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">OnboardAI</span>
            </Link>
            <span className="text-foreground-subtle">/</span>
            <span className="text-sm text-foreground-muted">CLI Docs</span>
            <span className="hidden rounded-full border border-border bg-background-muted px-2 py-0.5 font-mono text-[10px] text-foreground-muted sm:inline-block">
              v1.0.0
            </span>
          </div>

          {/* Right: nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/security"
              className="rounded-lg px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
            >
              Security
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href="/sign-in"
              className="ml-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
