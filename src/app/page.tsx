// app/page.tsx
import { ArrowRight, Zap, Shield, MessageSquare, Users, CheckCircle2, ChevronRight, Star, GitBranch, Code2, Sparkles, ArrowUpRight, Play, Pause, Terminal, Brackets, GitMerge, Box, Layers, Workflow, Cpu, Globe, Lock, BarChart3, Clock, TrendingUp, Menu, X, GitBranchIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-purple-950/40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                    <Terminal className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="font-bold text-white text-xl tracking-tight">OnboardAI</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-1">
                {['Product', 'Solutions', 'Enterprise', 'Docs', 'Pricing'].map((item) => (
                  <Link 
                    key={item}
                    href={`/${item.toLowerCase()}`} 
                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <div className="h-5 w-px bg-white/10 hidden sm:block" />
              <Link 
                href="/signup" 
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative block text-sm font-medium text-white bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-2.5 rounded-lg group-hover:bg-white/15 transition-all">
                  Get Started
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-white/80 tracking-wide">PRIVATE BETA — 200+ DEVELOPERS ONBOARDED</span>
                <ArrowUpRight className="h-3 w-3 text-white/40" />
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="block text-white">Ship your first PR</span>
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  in days, not months
                </span>
              </h1>
              
              <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
                OnboardAI reads your GitHub repository and generates a living, interactive guide 
                that helps new engineers understand your codebase and start contributing immediately.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup" className="group relative inline-flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-xl flex items-center gap-3 shadow-2xl shadow-indigo-600/20">
                    Start building today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                
                <Link href="#demo" className="group relative inline-flex items-center">
                  <span className="relative bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all">
                    <Play className="h-5 w-5" />
                    Watch demo
                    <span className="text-white/40 text-xs ml-2">2:45</span>
                  </span>
                </Link>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/[0.06]">
                {[
                  { value: '80%', label: 'Faster onboarding', sub: 'vs industry average' },
                  { value: '3-5', label: 'Days to first PR', sub: 'down from 4-8 weeks' },
                  { value: '15-20h', label: 'Senior dev time saved', sub: 'per new hire' },
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold text-white tracking-tight">{metric.value}</div>
                    <div className="text-sm font-medium text-white/80 mt-1">{metric.label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{metric.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Interactive Demo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              
              <div className="relative bg-[#131316] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1E] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="ml-3 text-xs font-mono text-white/40">onboardai ~/codebase/guide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      LIVE DEMO
                    </span>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-5 space-y-4">
                  {/* Repository Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <GitBranch className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-mono text-white/80">acme/api-service</span>
                    <span className="text-xs text-white/30">main</span>
                    <span className="ml-auto text-xs text-white/40 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Scanned 2 min ago
                    </span>
                  </div>

                  {/* Architecture Summary */}
                  <div className="bg-[#0A0A0C] rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Box className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Architecture Overview</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      <span className="text-white">Modular monolith</span> with clear service boundaries. 
                      Core modules: <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">auth</span>, 
                      <span className="font-mono text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded ml-1">api</span>, 
                      <span className="font-mono text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded ml-1">database</span>.
                      <span className="block mt-2 text-white/50">Built with TypeScript, Express, PostgreSQL.</span>
                    </p>
                  </div>

                  {/* Module Radar */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'auth', percentage: 94, color: 'indigo', desc: 'JWT + OAuth2' },
                      { name: 'api', percentage: 88, color: 'purple', desc: 'REST + GraphQL' },
                      { name: 'database', percentage: 76, color: 'emerald', desc: 'Prisma ORM' },
                      { name: 'queue', percentage: 62, color: 'amber', desc: 'Bull + Redis' },
                    ].map((module) => (
                      <div key={module.name} className="bg-[#0A0A0C] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-white/70">{module.name}</span>
                          <span className="text-[10px] text-white/30">{module.percentage}% match</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              module.color === 'indigo' ? 'from-indigo-500 to-indigo-400' :
                              module.color === 'purple' ? 'from-purple-500 to-purple-400' :
                              module.color === 'emerald' ? 'from-emerald-500 to-emerald-400' :
                              'from-amber-500 to-amber-400'
                            } rounded-full`}
                            style={{ width: `${module.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-1.5">{module.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tribal Knowledge */}
                  <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-lg p-4 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Tribal Knowledge Unlocked</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { rule: 'Always use async/await — no raw promises', confidence: 98 },
                        { rule: 'PR titles must follow Conventional Commits', confidence: 94 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs text-white/80">{item.rule}</span>
                            <span className="text-[10px] text-white/30 ml-2">{item.confidence}% confidence</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Preview */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Ask anything about this codebase..."
                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                      <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors">
                      Ask
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-[#131316] border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">First PR ready</div>
                    <div className="text-[10px] text-emerald-400">3 starter tasks available</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 bg-[#131316] border border-white/10 rounded-lg px-4 py-2 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-white/50" />
                  <span className="text-xs text-white/70">
                    <span className="font-medium text-white">12</span> engineers onboarded this week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="relative z-10 py-12 border-y border-white/[0.06] overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-white/30 mb-8">
            Trusted by engineering teams worldwide
          </p>
          <div className="flex items-center justify-around gap-8 opacity-40">
            {['VERCEL ▲', 'LINEAR', 'SUPABASE', 'PLANETSCALE', 'RAILWAY', 'REPLIT'].map((company) => (
              <span key={company} className="text-sm font-bold text-white/60 tracking-wide">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Asymmetric Grid */}
      <section className="relative z-10 py-28 px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Feature Card 1 - Large */}
            <div className="lg:col-span-7 bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-indigo-400" />
                </div>
                <span className="text-xs font-mono text-white/20">01</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Zero manual documentation</h3>
              <p className="text-white/50 leading-relaxed mb-6">
                Connect your GitHub repository and watch as OnboardAI analyzes commits, PRs, and code structure 
                to generate a comprehensive, always-up-to-date guide for every new hire.
              </p>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                  <Terminal className="h-3 w-3" />
                  <span>Connected repositories update automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  <span className="text-xs text-white/30">Live sync enabled</span>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Medium */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-purple-400" />
                </div>
                <span className="text-xs font-mono text-white/20">02</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Role-based personalization</h3>
              <p className="text-white/50 leading-relaxed">
                Frontend, backend, or full-stack — each new hire receives a tailored onboarding experience 
                focused on the parts of the codebase they'll actually work with.
              </p>
              <div className="mt-6 flex -space-x-2">
                {['FE', 'BE', 'FS', 'DevOps'].map((role) => (
                  <div key={role} className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-[#131316] flex items-center justify-center">
                    <span className="text-xs font-bold text-white/60">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Card 3 - Medium */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-white/20">03</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Conversational codebase</h3>
              <p className="text-white/50 leading-relaxed mb-6">
                New hires ask questions in plain English and get instant, accurate answers grounded 
                in your actual codebase — no more Slack interrupts for senior developers.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 bg-black/30 rounded-lg border border-white/10 px-3 flex items-center">
                  <span className="text-xs text-white/40">"How does auth work?"</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Feature Card 4 - Large */}
            <div className="lg:col-span-7 bg-gradient-to-br from-indigo-950/30 via-purple-950/30 to-transparent border border-indigo-500/20 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-500 group">
              <div className="flex items-start gap-6">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GitBranch className="h-7 w-7 text-amber-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">First PR recommendations</h3>
                  <p className="text-white/50 leading-relaxed mb-6">
                    Our AI analyzes open issues and suggests the perfect starter tasks based on complexity, 
                    impact, and alignment with the new hire's role.
                  </p>
                  <Link href="#" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    See how it works
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="hidden xl:block flex-1">
                  <div className="space-y-3">
                    {[
                      { issue: 'fix: Update README with setup steps', difficulty: 'Easy', time: '~30 min' },
                      { issue: 'feat: Add input validation to auth flow', difficulty: 'Medium', time: '~2 hrs' },
                      { issue: 'refactor: Extract API client to shared module', difficulty: 'Medium', time: '~3 hrs' },
                    ].map((task, i) => (
                      <div key={i} className="bg-black/30 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-white/70 block mb-1">{task.issue}</span>
                          <span className="text-[10px] text-white/30">{task.time}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          task.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {task.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="relative z-10 py-28 px-6 lg:px-8 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Workflow className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-white/60 tracking-wide">HOW IT WORKS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              From zero to first PR in minutes
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              No complex setup. No manual documentation. Just connect and watch the magic happen.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent hidden lg:block" />
            
            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Connect your repository',
                  description: 'Authenticate with GitHub in one click. Select the repository and branch you want to analyze.',
                  icon: <GitBranchIcon className="h-6 w-6" />,
                  color: 'indigo'
                },
                {
                  step: '02',
                  title: 'AI analyzes your codebase',
                  description: 'Our AI scans commits, PRs, code structure, and documentation to build a comprehensive knowledge graph.',
                  icon: <Cpu className="h-6 w-6" />,
                  color: 'purple'
                },
                {
                  step: '03',
                  title: 'Generate personalized guide',
                  description: 'Within minutes, OnboardAI creates an interactive onboarding guide tailored to your new hire\'s role.',
                  icon: <Layers className="h-6 w-6" />,
                  color: 'emerald'
                },
                {
                  step: '04',
                  title: 'New hire ships first PR',
                  description: 'Armed with context and recommended starter tasks, new engineers start contributing on day one.',
                  icon: <GitMerge className="h-6 w-6" />,
                  color: 'amber'
                },
              ].map((item, i) => (
                <div key={i} className={`relative flex flex-col lg:flex-row gap-8 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex lg:w-1/2 lg:justify-end">
                    <div className={`lg:w-[calc(50%-2rem)] ${i % 2 === 1 ? 'lg:ml-auto' : ''}`}>
                      <div className="bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                            item.color === 'indigo' ? 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30' :
                            item.color === 'purple' ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30' :
                            item.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30' :
                            'from-amber-500/20 to-amber-600/20 border-amber-500/30'
                          } border flex items-center justify-center`}>
                            <div className={
                              item.color === 'indigo' ? 'text-indigo-400' :
                              item.color === 'purple' ? 'text-purple-400' :
                              item.color === 'emerald' ? 'text-emerald-400' :
                              'text-amber-400'
                            }>
                              {item.icon}
                            </div>
                          </div>
                          <span className="text-3xl font-bold text-white/10 tracking-wider">{item.step}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Enterprise Focus */}
      <section className="relative z-10 py-28 px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-white/60 tracking-wide">PRICING</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple pricing, enterprise ready
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              Start with a free trial. Scale as your team grows.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '49',
                description: 'Perfect for small teams getting started',
                features: ['Up to 5 seats', '1 repository', 'Full codebase tour', 'Chat with your codebase', 'Role-based personalization'],
                cta: 'Start free trial',
                popular: false
              },
              {
                name: 'Pro',
                price: '99',
                description: 'For growing teams shipping fast',
                features: ['Up to 20 seats', '3 repositories', 'Everything in Starter', 'Auto-updates on push', 'Starter task suggestions', 'Slack notifications', 'Priority support'],
                cta: 'Start free trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations with complex needs',
                features: ['Unlimited seats', 'Unlimited repositories', 'Everything in Pro', 'SSO / SAML', 'Audit logs', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
                cta: 'Contact sales',
                popular: false
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-indigo-950/30 to-transparent border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' 
                    : 'bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10'
                } hover:border-white/20 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/40 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-white/40">/month</span>
                    </>
                  )}
                </div>
                
                <Link 
                  href="/signup" 
                  className={`block text-center py-3 rounded-lg font-medium mb-8 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-indigo-400' : 'text-emerald-400'
                      }`} />
                      <span className="text-sm text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-indigo-950/30 via-purple-950/30 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300 tracking-wide">ENTERPRISE READY</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Need custom security or compliance features?</h3>
            <p className="text-white/50 mb-6 max-w-2xl mx-auto">
              SOC 2 Type II certified, SSO/SAML, audit logs, and dedicated support. We work with your security team.
            </p>
            <Link href="/enterprise" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-all">
              Talk to enterprise sales
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="relative z-10 py-20 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {[
              { value: '80%', label: 'Faster time-to-productivity', trend: '+23% vs industry' },
              { value: '3.2 days', label: 'Average time to first PR', trend: 'Down from 4-8 weeks' },
              { value: '18 hours', label: 'Senior dev time saved', trend: 'Per new hire' },
              { value: '94%', label: 'New hire satisfaction', trend: '+31% vs baseline' },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-[#131316] to-[#0A0A0C] border border-white/10 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-white/60 mb-2">{stat.label}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-28 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-indigo-950/50 via-purple-950/50 to-indigo-950/50 border border-indigo-500/30 rounded-3xl p-16 text-center overflow-hidden">
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight relative">
              Ready to accelerate your<br />developer onboarding?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto relative">
              Join hundreds of engineering teams who've cut onboarding time by 80% and improved new hire satisfaction.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link href="/signup" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-xl shadow-2xl shadow-indigo-600/20">
                  Start free trial — no credit card
                </span>
              </Link>
              
              <Link href="/demo" className="relative block bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                Schedule a demo
              </Link>
            </div>
            
            <p className="text-sm text-white/30 mt-6 relative">
              <Globe className="inline-block h-3.5 w-3.5 mr-1.5" />
              Trusted by developers at 500+ companies worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#0A0A0B]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">OnboardAI</span>
              </Link>
              <p className="text-sm text-white/40 mb-6 max-w-xs">
                AI-powered developer onboarding that helps new engineers ship their first PR in days, not months.
              </p>
              <div className="flex items-center gap-3">
                {['GitHub', 'Twitter', 'LinkedIn', 'Discord'].map((social) => (
                  <Link key={social} href="#" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                    <span className="text-xs font-medium">{social[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Demo', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact', 'Partners'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'API Reference', 'Guides', 'Community', 'Status'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy', 'Terms', 'Security', 'Cookies', 'DPA'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; 2026 OnboardAI, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400/50" />
                <span className="text-xs text-white/30">SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-white/30" />
                <span className="text-xs text-white/30">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}