// app/signin/page.tsx
import type { Metadata } from "next"
import { GitBranch, ArrowRight, Lock, Zap, Sparkles, Shield, MessageSquare, Target, ClipboardList, Clock } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = { 
  title: "Sign in — OnboardAI",
  description: "Sign in with GitHub to access your personalized onboarding dashboard."
}

const TRUST_ITEMS = [
  { icon: Lock, label: "SOC 2 Type II", color: "emerald" },
  { icon: Shield, label: "Read-only by default", color: "blue" },
  { icon: Zap, label: "Setup in 2 minutes", color: "amber" },
]


export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-[#f5f3f0] to-[#f0eeea] flex items-center justify-center p-4">
      {/* Background ambient elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-amber-100/20 via-amber-50/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-tl from-orange-100/20 via-amber-50/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative h-10 w-10 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm rounded-xl flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-amber-700" />
              </div>
            </div>
            <span className="font-bold text-stone-800 text-xl tracking-tight">OnboardAI</span>
          </Link>
        </div>

        {/* Card content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-amber-200/40 p-6 space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-stone-800">
              Welcome back
            </h1>
            <p className="text-sm leading-relaxed text-stone-500">
              Sign in with GitHub to access your onboarding dashboard.
            </p>
          </div>

          {/* GitHub sign-in button */}
          <div className="space-y-4">
            <a
              href="/api/auth/github"
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              <span>Continue with GitHub</span>
              <ArrowRight className="h-4 w-4 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {TRUST_ITEMS.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${
                    color === 'emerald' ? 'text-emerald-600' :
                    color === 'blue' ? 'text-blue-600' :
                    'text-amber-600'
                  }`} />
                  <span className="text-xs text-stone-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 backdrop-blur-sm px-3 text-xs text-stone-400 font-medium">
                What you get access to
              </span>
            </div>
          </div>

          {/* Auto-signup note */}
          <p className="text-center text-xs text-stone-400 pt-2 border-t border-amber-200/20">
            New to OnboardAI?{" "}
            <span className="font-medium text-amber-700">
              Account created automatically on first sign-in.
            </span>
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <Link href="/privacy" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Privacy
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/terms" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Terms
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/security" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Security
          </Link>
        </div>
      </div>
    </div>
  )
}