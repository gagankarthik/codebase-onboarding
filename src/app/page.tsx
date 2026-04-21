// app/page.tsx
"use client"

import { ArrowRight, Zap, Shield, MessageSquare, Users, CheckCircle2, ChevronRight, Star, GitBranch, Code2, Sparkles, ArrowUpRight, Play, Terminal, Box, Clock, Workflow, Cpu, Layers, GitMerge, BarChart3, TrendingUp, Globe, Lock, Building2, Award, Quote, ChevronDown, Menu, X, Copy, Check, Wand2, FileCode, Blocks, GitBranchIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function LandingPage() {
  const [copied, setCopied] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyCommand = () => {
    navigator.clipboard?.writeText('npm i onboarding-ai')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-[#f5f3f0] to-[#f0eeea] font-sans antialiased">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-amber-100/30 via-amber-50/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-blue-100/20 via-indigo-50/10 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:2000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-50/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse [animation-delay:4000ms]" />
      </div>

      {/* Announcement Bar */}
      <div className="relative bg-gradient-to-r from-amber-900/90 via-amber-800/90 to-amber-900/90 text-white overflow-hidden border-b border-amber-700/20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:200%_200%] animate-shimmer" />
        <div className="relative px-4 py-2.5 text-center text-sm">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="font-medium">OnboardAI 2.0 is here</span>
            </span>
            <span className="text-white/60 hidden sm:inline">—</span>
            <span className="text-white/80">Real-time codebase analysis with personalized learning paths</span>
            <Link href="/changelog" className="inline-flex items-center gap-1 text-white font-medium underline-offset-4 hover:underline ml-2 group">
              Learn more
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-8 lg:gap-12">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  <div className="relative h-9 w-9 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm rounded-xl flex items-center justify-center group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    <Terminal className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <span className="font-bold text-stone-800 text-xl tracking-tight">OnboardAI</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-1">
                {[
                  { name: 'Product', hasDropdown: true },
                  { name: 'Solutions', hasDropdown: true },
                  { name: 'Enterprise', hasDropdown: false },
                  { name: 'Pricing', hasDropdown: false },
                  { name: 'Docs', hasDropdown: false },
                ].map((item) => (
                  <div key={item.name} className="relative group">
                    <Link 
                      href={`/${item.name.toLowerCase()}`} 
                      className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100/60"
                    >
                      {item.name}
                      {item.hasDropdown && <ChevronDown className="h-4 w-4 text-stone-400 group-hover:rotate-180 transition-transform duration-200" />}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <Link 
                href="/signin" 
                className="relative group overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-[length:200%_100%] group-hover:animate-gradient-shift" />
                <span className="relative block text-white text-[15px] font-medium px-5 py-2.5">
                  Get started
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5 text-stone-700" /> : <Menu className="h-5 w-5 text-stone-700" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-12 lg:pt-20 pb-16 lg:pb-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="relative">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-amber-200/40 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-white flex items-center justify-center">
                          <span className="text-[9px] font-bold text-amber-700">{String.fromCharCode(64 + i)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-stone-700">
                    Trusted by <span className="font-bold text-amber-700">500+</span> engineering teams
                  </span>
                </div>
                
                <div className="animate-fade-in-up [animation-delay:100ms]">
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-stone-800 leading-[1.15] mb-6">
                    <span className="block">Ship your first PR</span>
                    <span className="block relative mt-2">
                      <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                        in days, not months
                      </span>
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 320 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 10C80 4 240 4 318 10" stroke="url(#hero-underline)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                        <defs>
                          <linearGradient id="hero-underline" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#D97706" />
                            <stop offset="0.5" stopColor="#EA580C" />
                            <stop offset="1" stopColor="#E11D48" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                </div>
                
                <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg animate-fade-in-up [animation-delay:200ms]">
                  OnboardAI analyzes your GitHub repository and creates a personalized, 
                  interactive onboarding experience that helps new engineers understand 
                  your codebase and start shipping code immediately.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fade-in-up [animation-delay:300ms]">
                  <Link href="/signup" className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-[length:200%_100%] group-hover:animate-gradient-shift" />
                    <span className="relative text-white font-medium px-8 py-4 flex items-center gap-2">
                      Start free trial — no credit card
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <button className="group inline-flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white text-stone-700 font-medium px-8 py-4 rounded-xl border border-amber-200/40 shadow-sm hover:shadow-md transition-all duration-300">
                    <Play className="mr-2 h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                    Watch product tour
                    <span className="ml-2 text-xs text-stone-400 font-mono bg-stone-100 px-2 py-0.5 rounded-full">3:24</span>
                  </button>
                </div>

                {/* Quick Install */}
                <div className="animate-fade-in-up [animation-delay:400ms]">
                  <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Start in seconds</p>
                  <div className="inline-flex items-center gap-2 bg-stone-900/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-stone-700 shadow-lg">
                    <code className="text-sm font-mono text-amber-300">npx onboardai init</code>
                    <button 
                      onClick={copyCommand}
                      className="p-1.5 rounded-lg hover:bg-stone-700 transition-colors group"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-stone-400 group-hover:text-stone-200 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-stone-200/60 animate-fade-in-up [animation-delay:500ms]">
                  {[
                    { value: '80%', label: 'Faster onboarding', source: 'vs industry average', color: 'amber' },
                    { value: '3-5', label: 'Days to first PR', source: 'down from 4-8 weeks', color: 'orange' },
                    { value: '18h', label: 'Senior dev time saved', source: 'per new hire', color: 'rose' },
                  ].map((metric, i) => (
                    <div key={i} className="group cursor-default">
                      <div className={`text-3xl font-bold bg-gradient-to-r ${
                        metric.color === 'amber' ? 'from-amber-700 to-amber-600' :
                        metric.color === 'orange' ? 'from-orange-700 to-orange-600' :
                        'from-rose-700 to-rose-600'
                      } bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300`}>
                        {metric.value}
                      </div>
                      <div className="text-sm font-medium text-stone-700 mt-1">{metric.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{metric.source}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Interactive Preview */}
              <div className="relative lg:pl-8 animate-fade-in-up [animation-delay:200ms]">
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-rose-100/20 rounded-3xl blur-2xl opacity-60 animate-pulse" />
                
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-900/5 border border-amber-200/30 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                  {/* Window Controls */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-stone-50/80 to-amber-50/80 border-b border-amber-200/30">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-rose-400/70 group-hover:bg-rose-400 transition-colors" />
                        <div className="h-3 w-3 rounded-full bg-amber-400/70 group-hover:bg-amber-400 transition-colors" />
                        <div className="h-3 w-3 rounded-full bg-emerald-400/70 group-hover:bg-emerald-400 transition-colors" />
                      </div>
                      <span className="ml-3 text-xs font-mono text-stone-500">acme/backend-service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative">
                        <span className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm animate-pulse" />
                        <span className="relative text-[10px] font-mono text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          LIVE DEMO
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-6 space-y-5">
                    {/* Repo Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-stone-200/50">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-center shadow-sm">
                        <GitBranch className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-stone-800">api-service</span>
                          <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">main</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>Analyzed 2 minutes ago</span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <div className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Synced</span>
                        </div>
                      </div>
                    </div>

                    {/* Architecture Summary */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-xl p-4 border border-amber-200/40">
                      <div className="flex items-center gap-2 mb-3">
                        <Box className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Architecture Overview</span>
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        <span className="font-semibold text-stone-800">Modular monolith</span> with clear service boundaries. 
                        Core modules include{' '}
                        <span className="inline-flex items-center gap-1">
                          <span className="font-mono text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">auth</span>
                          <span className="font-mono text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">api</span>
                          <span className="font-mono text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">database</span>
                        </span>
                      </p>
                    </div>

                    {/* Module Cards with Hover Effects */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'auth', relevance: 94, color: 'amber', description: 'JWT + OAuth2', files: 12 },
                        { name: 'api', relevance: 88, color: 'orange', description: 'REST endpoints', files: 34 },
                        { name: 'database', relevance: 76, color: 'emerald', description: 'Prisma ORM', files: 8 },
                        { name: 'utils', relevance: 62, color: 'blue', description: 'Shared helpers', files: 15 },
                      ].map((module) => (
                        <div 
                          key={module.name} 
                          className="group bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-stone-200/60 hover:border-amber-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">{module.name}</span>
                            <span className="text-[10px] font-medium text-stone-400">{module.relevance}% relevant</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${
                                module.color === 'amber' ? 'from-amber-500 to-amber-400' :
                                module.color === 'orange' ? 'from-orange-500 to-orange-400' :
                                module.color === 'emerald' ? 'from-emerald-500 to-emerald-400' :
                                'from-blue-500 to-blue-400'
                              } group-hover:animate-pulse`}
                              style={{ width: `${module.relevance}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-stone-500">{module.description}</p>
                            <span className="text-[10px] text-stone-400">{module.files} files</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tribal Knowledge with Glow Effect */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-400/10 to-amber-400/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-amber-50/80 rounded-xl p-4 border border-amber-200/60">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Tribal Knowledge</span>
                        </div>
                        <div className="space-y-2.5">
                          {[
                            { rule: 'Use async/await — avoid raw promise chains', confidence: 98 },
                            { rule: 'Follow Conventional Commits for PR titles', confidence: 94 },
                          ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2 group/item">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                              <div className="flex-1">
                                <span className="text-xs text-stone-700">{item.rule}</span>
                                <span className="text-[10px] text-stone-400 ml-2">{item.confidence}% confidence</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chat Input with Focus Animation */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 relative group">
                        <input 
                          type="text" 
                          placeholder="Ask anything about this codebase..."
                          className="w-full bg-white/60 backdrop-blur-sm border border-stone-200/60 rounded-lg px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all"
                        />
                        <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 group-focus-within:text-amber-400 transition-colors" />
                      </div>
                      <button className="relative group overflow-hidden rounded-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 group-hover:animate-gradient-shift" />
                        <span className="relative block text-white text-sm font-medium px-5 py-2.5">
                          Ask
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Badges with Animations */}
                <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-amber-200/40 p-3 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl blur-md opacity-40 animate-pulse" />
                      <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-center">
                        <Code2 className="h-5 w-5 text-amber-700" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-800">3 starter tasks</div>
                      <div className="text-xs text-emerald-600">Ready for your first PR</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-amber-200/40 px-4 py-2.5 animate-float [animation-delay:1000ms]">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-white flex items-center justify-center">
                          <span className="text-[8px] font-bold text-amber-700">{String.fromCharCode(64 + i)}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-stone-600">
                      <span className="font-bold text-stone-800">12</span> engineers onboarded today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Marquee */}
        <section className="py-12 border-y border-amber-200/30 bg-gradient-to-r from-amber-50/30 via-transparent to-amber-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-400 mb-8">
              Trusted by innovative engineering teams worldwide
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {[
                { name: 'Vercel', logo: '▲', color: 'from-slate-700 to-slate-900' },
                { name: 'Linear', logo: '⚡', color: 'from-amber-500 to-orange-500' },
                { name: 'Supabase', logo: '🔷', color: 'from-emerald-600 to-emerald-800' },
                { name: 'PlanetScale', logo: '🌐', color: 'from-blue-600 to-indigo-600' },
                { name: 'Railway', logo: '🚂', color: 'from-purple-600 to-pink-600' },
                { name: 'Replit', logo: '▶️', color: 'from-orange-500 to-red-500' },
              ].map((company) => (
                <div key={company.name} className="group flex items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-300 cursor-default">
                  <span className={`text-2xl bg-gradient-to-br ${company.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                    {company.logo}
                  </span>
                  <span className="text-sm font-semibold text-stone-600">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid - Asymmetric Premium */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6 shadow-sm animate-fade-in-up">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Why OnboardAI</span>
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 tracking-tight mb-4 animate-fade-in-up [animation-delay:100ms]">
                Everything you need to onboard faster
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
                Stop wasting weeks on outdated documentation and endless Slack interruptions.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-5 lg:gap-6">
              {/* Feature 1 - Large Card */}
              <div className="lg:col-span-7 group bg-gradient-to-br from-white/80 via-amber-50/30 to-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-amber-200/40 shadow-sm hover:shadow-2xl hover:border-amber-300/60 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="relative h-14 w-14 mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Zap className="h-7 w-7 text-amber-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Zero manual documentation required</h3>
                    <p className="text-stone-600 leading-relaxed mb-6">
                      Connect your repository and watch as OnboardAI analyzes your codebase, 
                      pull requests, and commit history to generate a comprehensive guide that 
                      stays synchronized with every push.
                    </p>
                    <div className="flex items-center gap-2 text-sm group-hover:translate-x-1 transition-transform duration-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-stone-600">Always up to date with your latest changes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Medium Card */}
              <div className="lg:col-span-5 group bg-gradient-to-br from-white/80 via-orange-50/30 to-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-orange-200/40 shadow-sm hover:shadow-2xl hover:border-orange-300/60 transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-14 w-14 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Users className="h-7 w-7 text-orange-700" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-3">Personalized by role</h3>
                <p className="text-stone-600 leading-relaxed">
                  Frontend, backend, or full-stack — each developer receives a customized 
                  onboarding path focused on the specific parts of the codebase they'll 
                  actually work with.
                </p>
              </div>

              {/* Feature 3 - Medium Card */}
              <div className="lg:col-span-5 group bg-gradient-to-br from-white/80 via-emerald-50/30 to-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-emerald-200/40 shadow-sm hover:shadow-2xl hover:border-emerald-300/60 transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-14 w-14 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <MessageSquare className="h-7 w-7 text-emerald-700" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-3">Conversational codebase access</h3>
                <p className="text-stone-600 leading-relaxed">
                  New engineers ask questions in plain English and receive instant, 
                  accurate answers grounded directly in your actual source code.
                </p>
              </div>

              {/* Feature 4 - Large Card */}
              <div className="lg:col-span-7 group bg-gradient-to-br from-amber-100/30 via-amber-50/20 to-transparent backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-amber-300/40 shadow-sm hover:shadow-2xl hover:border-amber-400/60 transition-all duration-500 hover:-translate-y-1">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="relative h-14 w-14 mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                      <div className="relative h-14 w-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <GitBranch className="h-7 w-7 text-amber-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Smart starter task recommendations</h3>
                    <p className="text-stone-600 leading-relaxed mb-4">
                      Our AI analyzes open issues and suggests the perfect first tasks 
                      based on complexity, impact, and alignment with each developer's expertise.
                    </p>
                    <Link href="#" className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 group/link">
                      Learn more about our matching algorithm
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className="lg:w-72 space-y-2">
                    {[
                      { issue: 'Add input validation', difficulty: 'Easy', time: '~30 min', color: 'emerald' },
                      { issue: 'Refactor API client', difficulty: 'Medium', time: '~2 hrs', color: 'amber' },
                      { issue: 'Update README', difficulty: 'Easy', time: '~15 min', color: 'emerald' },
                    ].map((task, i) => (
                      <div key={i} className="group/task bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                        <span className="text-xs font-medium text-stone-800 block mb-2">{task.issue}</span>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            task.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {task.difficulty}
                          </span>
                          <span className="text-[10px] text-stone-400">{task.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-50/20 via-orange-50/20 to-amber-50/20 border-y border-amber-200/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-6">
              {[
                { value: '80%', label: 'Faster time-to-productivity', trend: '+23% vs industry', icon: TrendingUp, color: 'amber' },
                { value: '3.2 days', label: 'Average time to first PR', trend: 'Down from 4-8 weeks', icon: Clock, color: 'orange' },
                { value: '18 hours', label: 'Senior dev time saved', trend: 'Per new hire', icon: Users, color: 'rose' },
                { value: '94%', label: 'New hire satisfaction', trend: '+31% vs baseline', icon: Award, color: 'emerald' },
              ].map((stat, i) => (
                <div key={i} className="group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-amber-200/30 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                    stat.color === 'amber' ? 'from-amber-100 to-amber-50 border-amber-200' :
                    stat.color === 'orange' ? 'from-orange-100 to-orange-50 border-orange-200' :
                    stat.color === 'rose' ? 'from-rose-100 to-rose-50 border-rose-200' :
                    'from-emerald-100 to-emerald-50 border-emerald-200'
                  } border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${
                      stat.color === 'amber' ? 'text-amber-700' :
                      stat.color === 'orange' ? 'text-orange-700' :
                      stat.color === 'rose' ? 'text-rose-700' :
                      'text-emerald-700'
                    }`} />
                  </div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${
                    stat.color === 'amber' ? 'from-amber-700 to-amber-600' :
                    stat.color === 'orange' ? 'from-orange-700 to-orange-600' :
                    stat.color === 'rose' ? 'from-rose-700 to-rose-600' :
                    'from-emerald-700 to-emerald-600'
                  } bg-clip-text text-transparent tracking-tight mb-1`}>{stat.value}</div>
                  <div className="text-sm font-medium text-stone-700 mb-1">{stat.label}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Elegant Timeline */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200/40 rounded-full px-4 py-1.5 mb-6 shadow-sm animate-fade-in-up">
                <Workflow className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">How It Works</span>
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 tracking-tight mb-4 animate-fade-in-up [animation-delay:100ms]">
                From connection to contribution in minutes
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
                No complex configuration. Just connect your repository and start onboarding.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Connect repository',
                  description: 'Authenticate with GitHub and select the repository you want to analyze. One click and you\'re ready.',
                  icon: <GitBranchIcon className="h-6 w-6" />,
                  color: 'amber'
                },
                {
                  step: '02',
                  title: 'AI analysis',
                  description: 'Our AI engine scans commits, PRs, code structure, and conventions to build a comprehensive knowledge graph.',
                  icon: <Cpu className="h-6 w-6" />,
                  color: 'orange'
                },
                {
                  step: '03',
                  title: 'Generate guide',
                  description: 'Within minutes, OnboardAI creates a personalized, interactive onboarding experience for your new hire.',
                  icon: <Layers className="h-6 w-6" />,
                  color: 'emerald'
                },
                {
                  step: '04',
                  title: 'Ship first PR',
                  description: 'Armed with context and starter tasks, new engineers begin contributing on day one.',
                  icon: <GitMerge className="h-6 w-6" />,
                  color: 'rose'
                },
              ].map((item, i) => (
                <div key={i} className="relative flex gap-6 pb-12 last:pb-0 group">
                  {i < 3 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-amber-200 via-orange-200 to-transparent" />
                  )}
                  <div className={`relative z-10 h-12 w-12 rounded-xl bg-gradient-to-br ${
                    item.color === 'amber' ? 'from-amber-50 to-amber-100 border-amber-200' :
                    item.color === 'orange' ? 'from-orange-50 to-orange-100 border-orange-200' :
                    item.color === 'emerald' ? 'from-emerald-50 to-emerald-100 border-emerald-200' :
                    'from-rose-50 to-rose-100 border-rose-200'
                  } border shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={
                      item.color === 'amber' ? 'text-amber-700' :
                      item.color === 'orange' ? 'text-orange-700' :
                      item.color === 'emerald' ? 'text-emerald-700' :
                      'text-rose-700'
                    }>
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-mono font-semibold ${
                        item.color === 'amber' ? 'text-amber-600' :
                        item.color === 'orange' ? 'text-orange-600' :
                        item.color === 'emerald' ? 'text-emerald-600' :
                        'text-rose-600'
                      }`}>{item.step}</span>
                      <h3 className="text-xl font-bold text-stone-800">{item.title}</h3>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/20 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200/40 rounded-full px-4 py-1.5 mb-6 shadow-sm animate-fade-in-up">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Testimonials</span>
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 tracking-tight mb-4 animate-fade-in-up [animation-delay:100ms]">
                Loved by engineering leaders
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
                See what CTOs and VPs of Engineering are saying about OnboardAI.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  quote: "OnboardAI transformed how we bring new engineers up to speed. What used to take weeks now happens in days. Our senior developers finally have uninterrupted deep work time.",
                  author: "Sarah Chen",
                  role: "VP of Engineering",
                  company: "Vercel",
                  color: 'amber'
                },
                {
                  quote: "The personalized onboarding paths are a game-changer. Each new hire gets exactly what they need without being overwhelmed. We've cut our time-to-productivity by over 70%.",
                  author: "Marcus Rodriguez",
                  role: "CTO",
                  company: "Linear",
                  color: 'orange'
                },
                {
                  quote: "Finally, a tool that actually understands how developers learn. The conversational interface means new engineers get answers instantly without interrupting the team.",
                  author: "Emily Watson",
                  role: "Head of Developer Experience",
                  company: "Supabase",
                  color: 'emerald'
                },
              ].map((testimonial, i) => (
                <div key={i} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-200/40 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <Quote className={`h-8 w-8 ${
                    testimonial.color === 'amber' ? 'text-amber-200' :
                    testimonial.color === 'orange' ? 'text-orange-200' :
                    'text-emerald-200'
                  } mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <p className="text-stone-700 leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${
                      testimonial.color === 'amber' ? 'from-amber-100 to-amber-200 border-amber-300' :
                      testimonial.color === 'orange' ? 'from-orange-100 to-orange-200 border-orange-300' :
                      'from-emerald-100 to-emerald-200 border-emerald-300'
                    } border flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${
                        testimonial.color === 'amber' ? 'text-amber-700' :
                        testimonial.color === 'orange' ? 'text-orange-700' :
                        'text-emerald-700'
                      }`}>
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800">{testimonial.author}</div>
                      <div className="text-sm text-stone-500">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing - Enterprise Grade */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200/40 rounded-full px-4 py-1.5 mb-6 shadow-sm animate-fade-in-up">
                <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Pricing</span>
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 tracking-tight mb-4 animate-fade-in-up [animation-delay:100ms]">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
                Start with a free trial. Scale as your engineering team grows.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  description: 'Perfect for small teams',
                  features: ['Up to 5 seats', '1 repository', 'Full codebase tour', 'Chat with your codebase', 'Role-based personalization'],
                  popular: false,
                  color: 'stone'
                },
                {
                  name: 'Pro',
                  price: '$99',
                  description: 'For growing teams',
                  features: ['Up to 20 seats', '3 repositories', 'Everything in Starter', 'Auto-updates on push', 'Starter task suggestions', 'Slack notifications', 'Priority support'],
                  popular: true,
                  color: 'amber'
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  description: 'For large organizations',
                  features: ['Unlimited seats', 'Unlimited repositories', 'Everything in Pro', 'SSO / SAML', 'Audit logs', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
                  popular: false,
                  color: 'stone'
                },
              ].map((plan, i) => (
                <div 
                  key={i} 
                  className={`relative group rounded-2xl p-8 transition-all duration-500 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 shadow-2xl shadow-amber-200/50 scale-105 lg:scale-110 z-10' 
                      : 'bg-white/70 backdrop-blur-sm border border-stone-200/60 shadow-sm hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-stone-800 mb-2">{plan.name}</h3>
                  <p className="text-sm text-stone-500 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.price === 'Custom' ? (
                      <span className="text-4xl font-bold text-stone-800">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-stone-800">{plan.price}</span>
                        <span className="text-stone-400">/month</span>
                      </>
                    )}
                  </div>
                  
                  <Link 
                    href="/signup" 
                    className={`relative block text-center py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg'
                        : 'bg-stone-800 text-white hover:bg-stone-700'
                    }`}
                  >
                    <span className="relative z-10">
                      {plan.price === 'Custom' ? 'Contact sales' : 'Start free trial'}
                    </span>
                  </Link>
                  
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 group/item">
                        <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 transition-all duration-300 ${
                          plan.popular ? 'text-amber-500 group-hover/item:scale-110' : 'text-emerald-500'
                        }`} />
                        <span className="text-sm text-stone-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Enterprise CTA */}
            <div className="mt-20 max-w-4xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-400/10 to-amber-400/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-3xl p-10 lg:p-12 text-center shadow-xl border border-stone-600/30">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-amber-300">Enterprise Ready</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  Need custom security or compliance features?
                </h3>
                <p className="text-stone-300 mb-8 max-w-2xl mx-auto">
                  SOC 2 Type II certified, SSO/SAML integration, comprehensive audit logs, and dedicated support. 
                  We work directly with your security and compliance teams.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/enterprise" className="group/btn relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 group-hover/btn:animate-gradient-shift" />
                    <span className="relative block bg-white text-stone-800 font-medium px-8 py-3.5 rounded-xl m-[1px] group-hover/btn:bg-transparent group-hover/btn:text-white transition-all duration-300">
                      Talk to enterprise sales
                    </span>
                  </Link>
                  <Link href="/security" className="text-stone-300 hover:text-white font-medium px-8 py-3.5 transition-colors">
                    View security documentation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 tracking-tight mb-4 animate-fade-in-up">
              Ready to accelerate your developer onboarding?
            </h2>
            <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto animate-fade-in-up [animation-delay:100ms]">
              Join hundreds of engineering teams who've cut onboarding time by 80% 
              and improved new hire satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:200ms]">
              <Link href="/signup" className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-[length:200%_100%] group-hover:animate-gradient-shift" />
                <span className="relative block text-white font-medium px-8 py-4 flex items-center gap-2">
                  Start free trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/demo" className="bg-white/80 backdrop-blur-sm hover:bg-white text-stone-700 font-medium px-8 py-4 rounded-xl border border-amber-200/40 shadow-sm hover:shadow-md transition-all duration-300">
                Schedule a demo
              </Link>
            </div>
            <p className="text-sm text-stone-400 mt-6 animate-fade-in-up [animation-delay:300ms]">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-transparent to-amber-50/30 border-t border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  <div className="relative h-9 w-9 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm rounded-xl flex items-center justify-center">
                    <Terminal className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <span className="font-bold text-stone-800 text-lg">OnboardAI</span>
              </Link>
              <p className="text-sm text-stone-500 mb-6 max-w-xs">
                AI-powered developer onboarding that helps new engineers ship their first PR in days, not months.
              </p>
              <div className="flex items-center gap-2">
                {['GitHub', 'Twitter', 'LinkedIn'].map((social) => (
                  <Link key={social} href="#" className="h-9 w-9 rounded-lg bg-white/60 backdrop-blur-sm border border-amber-200/40 flex items-center justify-center text-stone-500 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300">
                    <span className="text-xs font-medium">{social[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Demo', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-4">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'API', 'Guides', 'Community'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy', 'Terms', 'Security', 'DPA'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-amber-200/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400">
              &copy; 2026 OnboardAI, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 group">
                <Lock className="h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-stone-400">SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2 group">
                <Globe className="h-3.5 w-3.5 text-stone-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-stone-400">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}