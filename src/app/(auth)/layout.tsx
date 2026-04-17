import { Users, Zap, TrendingUp } from "lucide-react"

const STATS = [
  { icon: Users, value: "200+", label: "teams onboarded" },
  { icon: Zap, value: "4.2 days", label: "avg to first PR" },
  { icon: TrendingUp, value: "80% faster", label: "onboarding time" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[oklch(0.3_0.243_264.4)] to-[oklch(0.165_0.2_264.4)] p-10 lg:flex lg:w-1/2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-sm font-semibold text-white">Codebase Onboarding</span>
        </div>

        <div className="space-y-6">
          <blockquote className="text-3xl font-light italic leading-relaxed text-white/90">
            "We cut our onboarding time from three weeks to four days. Every new hire
            says it's the best onboarding experience they've had."
          </blockquote>
          <div>
            <p className="font-semibold text-white">Sarah Chen</p>
            <p className="text-sm text-white/60">Engineering Lead at Acme Corp</p>
          </div>
        </div>

        <div className="flex gap-8">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
