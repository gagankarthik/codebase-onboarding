'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  GitBranch,
  Menu,
  MessageCircle,
  Rocket,
  Sparkles,
  Users,
  X,
  Zap,
  Building2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// --- Data ---
const STATS = [
  { label: 'Time to first meaningful PR', value: '1–3 mo', note: 'Industry average (Cortex 2024)' },
  { label: 'Cost to replace a developer', value: '$77K', note: 'Direct cost + lost velocity' },
  { label: 'Onboarding time reduction', value: '80%', note: '4 weeks → 3 days with AI' },
  { label: 'Senior dev hours lost', value: '15–20h', note: 'Per new hire, per cycle' },
];

const TIMELINE_STAGES = [
  { week: 'Week 1', title: 'Environment Hell', description: '2–5 days fighting local setup. Senior devs pulled away 8–12 times. New hire feels lost.', color: 'error' },
  { week: 'Weeks 2–3', title: 'Codebase Archaeology', description: 'Reading code with no context. Confluence docs are 18 months old. 60%+ of day spent reading.', color: 'error' },
  { week: 'Weeks 4–5', title: 'First PR (Finally)', description: 'Small bug fix gets rejected twice. 23% of new hires mentally check out.', color: 'warning' },
  { week: 'Weeks 6–7', title: 'Starting to Get It', description: 'Still asking daily questions. Tribal knowledge bottlenecks progress.', color: 'warning' },
  { week: 'Week 8+', title: 'Partial Productivity', description: 'Full productivity takes 3–6 months. $15–40K wasted per hire.', color: 'success' },
];

const FEATURE_COMPARISON = [
  { feature: 'Zero writing needed', mintlify: false, swimm: false, confluence: false, yours: true },
  { feature: 'Auto-reads GitHub repo', mintlify: 'partial', swimm: true, confluence: false, yours: true },
  { feature: 'Built for new hire onboarding', mintlify: false, swimm: 'partial', confluence: false, yours: true },
  { feature: 'Personalised by role/team', mintlify: false, swimm: false, confluence: false, yours: true },
  { feature: 'Chat with your codebase', mintlify: 'partial', swimm: false, confluence: 'partial', yours: true },
  { feature: 'Auto-updates as code changes', mintlify: 'partial', swimm: true, confluence: false, yours: true },
  { feature: 'Starter task suggestions', mintlify: false, swimm: false, confluence: false, yours: true },
];

const PRICING_TIERS = [
  { name: 'Starter', price: 49, description: 'Up to 5 seats · 1 repo', features: ['Full codebase tour generation', 'Chat with your codebase', 'Role-based personalisation', 'Manual refresh on demand', '1 active onboarding at a time'], cta: 'Start free trial', highlighted: false },
  { name: 'Growth', price: 99, description: 'Up to 20 seats · 3 repos', features: ['Everything in Starter', 'Auto-updates on every push', 'Unlimited concurrent onboardings', 'Starter task suggestions', 'Onboarding progress tracking', 'Slack notifications'], cta: 'Start free trial', highlighted: true, popular: true },
  { name: 'Scale', price: 249, description: 'Unlimited seats · Unlimited repos', features: ['Everything in Growth', 'Multi-repo architecture maps', 'Custom onboarding checklists', 'Time-to-first-PR analytics', 'Priority support + onboarding call', 'SSO / SAML'], cta: 'Contact sales', highlighted: false },
];

const MRR_DATA = [
  { month: 'M1', mrr: 490 },
  { month: 'M2', mrr: 1500 },
  { month: 'M3', mrr: 3500 },
  { month: 'M4', mrr: 7000 },
  { month: 'M5', mrr: 12000 },
  { month: 'M6', mrr: 18000 },
  { month: 'M7', mrr: 26000 },
  { month: 'M8', mrr: 35000 },
  { month: 'M9', mrr: 44000 },
  { month: 'M10', mrr: 52000 },
  { month: 'M11', mrr: 61000 },
  { month: 'M12', mrr: 68000 },
];

// --- UI Components ---
const SectionHeader = ({ label, title, description }: { label: string; title: string; description?: string }) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-medium text-primary mb-4">
      {label}
    </div>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">{title}</h2>
    {description && <p className="text-base text-foreground-muted leading-relaxed">{description}</p>}
  </div>
);

// --- Main Component ---
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-foreground">Codebase Onboarding</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {['How it works', 'Pricing', 'Customers'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/sign-in" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground-muted">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-4">
            <div className="flex flex-col gap-3">
              {['How it works', 'Pricing', 'Customers'].map((item) => (
                <a key={item} href="#" className="text-sm text-foreground-muted py-1.5">{item}</a>
              ))}
              <hr className="border-border my-1" />
              <Link href="/sign-in" className="text-sm text-foreground-muted py-1.5">Sign in</Link>
              <Link href="/sign-up" className="bg-primary text-primary-foreground py-2 rounded-full text-sm text-center font-medium">
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-subtle via-background to-background" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-1.5 text-sm text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by GPT-4o mini · Reads your actual codebase
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto mb-6 leading-[1.1]">
              New hires ship their{' '}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.59_0.243_290)] bg-clip-text text-transparent">
                first PR in days
              </span>
              {' '}not months
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect your GitHub repo. AI reads the codebase and generates a personalised, interactive
              onboarding guide for every new engineer — role-specific, always up to date.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-background-muted transition-colors">
                See how it works
              </a>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-foreground-muted">
              {[
                { icon: GitBranch, label: 'Connect GitHub repo' },
                { icon: Zap, label: 'AI scans & generates' },
                { icon: Users, label: 'Personalised by role' },
                { icon: MessageCircle, label: 'Chat with codebase' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16 bg-background-subtle border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="text-xs font-medium text-foreground-muted mb-2">{stat.label}</div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-foreground-subtle">{stat.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insight Box */}
        <section className="py-16" id="how-it-works">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-primary/20 bg-primary-subtle p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-base text-foreground leading-relaxed">
                  <strong>The gap nobody has filled:</strong>{' '}
                  Mintlify and Swimm solve public-facing docs and inline code comments.
                  Nobody has built a tool that auto-generates a new hire&apos;s first-week experience — an
                  interactive, personalised walkthrough of the actual codebase they&apos;re joining.
                  That&apos;s a completely different problem, and a completely different buyer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Timeline */}
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="The Problem"
              title="What actually happens during a developer's first 8 weeks"
              description="Without the right tools, onboarding is slow, painful, and expensive."
            />
            <div className="rounded-2xl border border-border overflow-hidden">
              {TIMELINE_STAGES.map((stage, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row border-b border-border last:border-b-0 ${
                    stage.color === 'error'
                      ? 'bg-destructive-subtle/40'
                      : stage.color === 'warning'
                      ? 'bg-warning-subtle/40'
                      : 'bg-success-subtle/40'
                  }`}
                >
                  <div className="sm:w-32 p-4 border-b sm:border-b-0 sm:border-r border-border flex sm:flex-col items-center justify-center gap-2 sm:gap-0">
                    <span className="text-xs font-medium text-foreground-muted">Period</span>
                    <span
                      className={`text-sm font-bold ${
                        stage.color === 'error'
                          ? 'text-destructive'
                          : stage.color === 'warning'
                          ? 'text-warning-foreground'
                          : 'text-success'
                      }`}
                    >
                      {stage.week}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-foreground mb-1">{stage.title}</h3>
                    <p className="text-foreground-muted text-sm">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="py-16 bg-background-subtle" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="The Solution"
              title="From repo connect to first PR in under a week"
              description="Five steps. Zero writing. Completely automated."
            />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { step: 'Connect GitHub', icon: GitBranch },
                { step: 'AI scans repo', icon: Zap },
                { step: 'Generate guide', icon: Sparkles },
                { step: 'Chat & learn', icon: MessageCircle },
                { step: 'Ship first PR', icon: Rocket },
              ].map(({ step, icon: Icon }, idx) => (
                <div key={idx} className="relative rounded-xl border border-border bg-card p-4 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary mx-auto mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium text-foreground-muted mb-1">Step {idx + 1}</div>
                  <div className="font-semibold text-foreground text-sm">{step}</div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-foreground-subtle z-10">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="text-foreground-muted text-center text-sm leading-relaxed">
                The output isn&apos;t just docs. It&apos;s a{' '}
                <strong className="text-foreground">personalised Day 1 experience</strong>:{' '}
                &ldquo;Here are the 5 modules you&apos;ll touch most. Here&apos;s the team&apos;s coding convention.
                Here are 3 starter tasks ranked by difficulty.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Market Landscape"
              title="Why the gap exists"
              description="Existing tools solve different problems. We're building something new."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Mintlify', pricing: '$300/mo · API docs', gap: 'Requires manual MDX writing. Buyer is DevRel, not the engineering manager. Not for onboarding.' },
                { name: 'Swimm', pricing: 'Free + paid · Code-linked docs', gap: "Devs must write the docs first. Keeps them synced, but won't generate them for you." },
                { name: 'Confluence / Notion', pricing: '$5–15/user · Generic wikis', gap: 'Always out of date. No live code connection. The engineering graveyard.' },
              ].map((comp) => (
                <div key={comp.name} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground">{comp.name}</h3>
                  <p className="text-xs text-foreground-muted mt-1">{comp.pricing}</p>
                  <div className="mt-4 text-xs font-medium text-warning-foreground">The gap:</div>
                  <p className="mt-1 text-sm text-foreground-muted">{comp.gap}</p>
                </div>
              ))}
              <div className="rounded-xl border border-primary bg-primary-subtle p-5">
                <h3 className="font-semibold text-foreground">Codebase Onboarding</h3>
                <p className="text-xs text-primary font-medium mt-1">$49–99/mo · Onboarding-first</p>
                <div className="mt-4 text-xs font-medium text-primary">Our advantage:</div>
                <p className="mt-1 text-sm text-foreground-muted">
                  Zero writing required. Reads your GitHub repo. Generates personalised guides per role. Built for the engineering manager.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-background-subtle" id="pricing">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Feature Comparison"
              title="Where we win"
              description="The complete advantage across every dimension that matters for engineering onboarding."
            />
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground-muted">Feature</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground-muted">Mintlify</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground-muted">Swimm</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground-muted">Confluence</th>
                    <th className="py-3 px-4 font-semibold text-primary text-left bg-primary-subtle/50">
                      Our Tool
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_COMPARISON.map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium text-foreground">{item.feature}</td>
                      {(['mintlify', 'swimm', 'confluence'] as const).map((key) => (
                        <td key={key} className="py-3 px-4">
                          {item[key] === true ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : item[key] === false ? (
                            <div className="w-4 h-4 rounded-full border border-border-strong" />
                          ) : (
                            <span className="text-xs text-warning-foreground font-medium">Partial</span>
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4 bg-primary-subtle/30">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MVP Build Plan — skip this section on landing, replaced by Pricing */}

        {/* Pricing Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Simple, Transparent Pricing"
              title="Choose the plan that fits your team"
              description="No per-seat surprises. Flat monthly pricing that scales with your team."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border p-6 ${
                    tier.highlighted
                      ? 'border-primary bg-primary-subtle'
                      : 'border-border bg-card'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most popular
                    </div>
                  )}
                  <div className="text-sm font-semibold text-foreground-muted mb-1">{tier.name}</div>
                  <div className="text-4xl font-bold text-foreground">
                    ${tier.price}
                    <span className="text-base font-normal text-foreground-muted">/mo</span>
                  </div>
                  <div className="text-sm text-foreground-muted mt-1 mb-5">{tier.description}</div>
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-primary' : 'text-success'}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`block w-full py-2.5 rounded-full text-center text-sm font-medium transition-colors ${
                      tier.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'border border-border text-foreground hover:bg-background-muted'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MRR Growth Chart */}
        <section className="py-16 bg-background-subtle">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Financial Projection"
              title="Realistic MRR growth path"
              description="Based on lean customer acquisition and validated demand signals."
            />
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MRR_DATA}>
                    <defs>
                      <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.546 0.243 264.4)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="oklch(0.546 0.243 264.4)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.914 0.005 264.5)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.52 0.025 231)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'oklch(0.52 0.025 231)' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'MRR']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid oklch(0.914 0.005 264.5)', background: 'oklch(1 0 0)' }}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="oklch(0.546 0.243 264.4)" strokeWidth={2} fill="url(#mrrGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-center text-xs text-foreground-muted">
                Projected MRR growth from $490 to $68,000 over 12 months
              </p>
            </div>
          </div>
        </section>

        {/* GTM Strategy */}
        <section className="py-16 bg-background" id="customers">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Go-to-Market"
              title="How we reach the first 50 customers"
              description="Targeted channels where engineering managers are already feeling this pain."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Users, title: 'YC Slack & Hacker News', body: 'YC companies are always hiring. A Show HN post reaches hundreds of engineering managers who live this problem daily.' },
                { icon: Building2, title: 'LinkedIn Cold Outreach', body: 'Target CTOs at 10–100 person companies that posted engineering jobs in the last 30 days. The pain is live and acute.' },
                { icon: Rocket, title: 'Build in Public', body: 'Post on Dev Twitter. "Day 14: generated a 30-page onboarding guide for a 50-file codebase in 4 minutes."' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-gradient-to-br from-[oklch(0.3_0.243_264.4)] to-[oklch(0.165_0.2_264.4)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to fix engineering onboarding?
            </h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Join teams already onboarding engineers 80% faster. Get your first guide generated in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 sm:w-72 text-sm"
              />
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[oklch(0.3_0.243_264.4)] hover:bg-white/90 transition-colors">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-5">No credit card required · Cancel anytime</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                    <Code2 className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-sm text-foreground">Codebase Onboarding</span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  AI-powered engineering onboarding for modern teams.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <h4 className="font-semibold text-xs text-foreground mb-3">{heading}</h4>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <a href="#" className="text-xs text-foreground-muted hover:text-foreground transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-border text-center text-xs text-foreground-subtle">
              © 2026 Codebase Onboarding. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}