// app/page.tsx
'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  Menu,
  MessageCircle,
  Rocket,
  Users,
  X,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
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
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'info' | 'purple'; className?: string }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
};

const Card = ({ children, className = '', highlighted = false }: { children: React.ReactNode; className?: string; highlighted?: boolean }) => (
  <div
    className={`bg-white rounded-2xl border ${
      highlighted
        ? 'border-green-500 shadow-xl shadow-green-50 ring-1 ring-green-500/20'
        : 'border-gray-200 shadow-sm'
    } ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ label, title, description }: { label: string; title: string; description?: string }) => (
  <div className="text-center max-w-2xl mx-auto mb-12">
    <Badge variant="info" className="mb-4">
      {label}
    </Badge>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">{title}</h2>
    {description && <p className="text-lg text-gray-600">{description}</p>}
  </div>
);

// --- Main Component ---
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">OnboardAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Product
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it works
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-700 hover:text-gray-900">Sign in</button>
              <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Get started →
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[65px] bg-white border-b border-gray-200 p-4 z-40">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-600 py-2">
                Product
              </a>
              <a href="#" className="text-gray-600 py-2">
                How it works
              </a>
              <a href="#" className="text-gray-600 py-2">
                Pricing
              </a>
              <a href="#" className="text-gray-600 py-2">
                FAQ
              </a>
              <hr className="my-2" />
              <button className="text-gray-700 py-2">Sign in</button>
              <button className="bg-gray-900 text-white py-2 rounded-full text-center">
                Get started →
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              <Badge variant="info">Level 2 Deep Dive</Badge>
              <Badge variant="success">Validated market</Badge>
              <Badge variant="warning">$20–70K MRR potential</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 max-w-5xl mx-auto mb-6">
              Codebase Onboarding{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Accelerator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              AI that reads your GitHub repo and generates a living, interactive guide so new hires
              ship in days — not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gray-900 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-all inline-flex items-center gap-2">
                Get started <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-50 transition-all">
                See how it works
              </button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
               
                Connect GitHub repo
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI scans & generates
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personalised for each role
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with your codebase
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16 bg-gray-50/50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, idx) => (
                <Card key={idx} className="p-6 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">{stat.label}</div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.note}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Insight Box */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-6 md:p-8">
              <p className="text-green-800 text-lg leading-relaxed">
                The gap you're filling:{' '}
                <strong>
                  Mintlify and Swimm solve public-facing docs and inline code comments.
                </strong>{' '}
                Nobody has built a tool that auto-generates a new hire's first-week experience — an
                interactive, personalised walkthrough of the actual codebase they're joining.
                That's a completely different problem, and a completely different buyer
                (engineering manager, not the developer).
              </p>
            </div>
          </div>
        </section>

        {/* Pain Timeline */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="The Problem"
              title="What actually happens during a developer's first 8 weeks"
              description="Without your tool, onboarding is slow, painful, and expensive."
            />
            <div className="space-y-0 border border-gray-200 rounded-2xl overflow-hidden">
              {TIMELINE_STAGES.map((stage, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row border-b last:border-b-0 ${
                    stage.color === 'error'
                      ? 'bg-red-50/30'
                      : stage.color === 'warning'
                      ? 'bg-amber-50/30'
                      : 'bg-green-50/30'
                  }`}
                >
                  <div className="sm:w-32 p-4 border-r border-gray-200 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">Week</span>
                    <span
                      className={`text-xl font-bold ${
                        stage.color === 'error'
                          ? 'text-red-600'
                          : stage.color === 'warning'
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}
                    >
                      {stage.week}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{stage.title}</h3>
                    <p className="text-gray-600 text-sm">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="The Solution"
              title="How your tool compresses this to 3–5 days"
              description="From GitHub connection to first PR in under a week."
            />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                'Connect GitHub',
                'AI scans repo',
                'Generate tour',
                'Chat & learn',
                'Ship first PR',
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="relative bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm"
                >
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3 font-semibold">
                    {idx + 1}
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{step}</div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-gray-600 text-center">
                The output isn't just docs. It's a{' '}
                <strong className="text-gray-900">personalised Day 1 experience</strong>:
                "Here are the 5 modules you'll touch most. Here's who wrote them and why. Here's
                the team's coding convention. Here are 3 starter tasks ranked by difficulty."
              </p>
            </div>
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Market Landscape"
              title="Why the gap exists"
              description="Existing tools solve different problems. You're building something new."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900">Mintlify</h3>
                <div className="text-sm text-gray-500 mt-1">$300/mo — public-facing API docs</div>
                <div className="mt-4 text-xs font-medium text-amber-700">Gap for you:</div>
                <div className="text-sm text-gray-600 mt-1">
                  Builds beautiful external docs but requires manual MDX. Not for onboarding. Buyer
                  is DevRel, not EM.
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900">Swimm</h3>
                <div className="text-sm text-gray-500 mt-1">Free + paid — code-linked docs</div>
                <div className="mt-4 text-xs font-medium text-amber-700">Gap for you:</div>
                <div className="text-sm text-gray-600 mt-1">
                  Keeps internal docs synced, but devs must write them first. Not an onboarding
                  accelerator.
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900">Confluence / Notion</h3>
                <div className="text-sm text-gray-500 mt-1">$5–15/user — generic wikis</div>
                <div className="mt-4 text-xs font-medium text-amber-700">Gap for you:</div>
                <div className="text-sm text-gray-600 mt-1">
                  Always out of date. No code connection. Engineering graveyard.
                </div>
              </Card>
              <Card highlighted className="p-6 border-green-500">
                <h3 className="font-semibold text-gray-900">Your Tool</h3>
                <div className="text-sm text-green-600 font-medium mt-1">
                  $49–99/seat — onboarding-first
                </div>
                <div className="mt-4 text-xs font-medium text-green-700">Your differentiation:</div>
                <div className="text-sm text-gray-600 mt-1">
                  Zero writing. Connects to GitHub. Generates entire onboarding. Personalised per
                  role. For the EM.
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Feature Deep Dive"
              title="Where you win"
              description="A clear, undeniable advantage across every dimension that matters for engineering onboarding."
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Feature</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Mintlify</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Swimm</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Confluence</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 bg-green-50 rounded-t-lg">
                      Your Tool
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_COMPARISON.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.feature}</td>
                      <td className="py-3 px-4">
                        {typeof item.mintlify === 'boolean' ? (
                          item.mintlify ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                          )
                        ) : (
                          <span className="text-amber-600 text-xs">Partial</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {typeof item.swimm === 'boolean' ? (
                          item.swimm ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                          )
                        ) : (
                          <span className="text-amber-600 text-xs">Partial</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {typeof item.confluence === 'boolean' ? (
                          item.confluence ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                          )
                        ) : (
                          <span className="text-amber-600 text-xs">Partial</span>
                        )}
                      </td>
                      <td className="py-3 px-4 bg-green-50/30">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MVP Build Plan */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="The Roadmap"
              title="MVP build plan — 6–8 weeks to launch"
              description="A focused, lean approach to get your first paying customers fast."
            />
            <div className="space-y-4">
              {[
                'Week 1–2: GitHub OAuth + repo ingestion — build the data pipeline.',
                'Week 3–4: AI codebase summary generation — module explanations, architecture overview.',
                'Week 5: Role intake form + personalisation — customise for each new hire.',
                'Week 6: Chat interface — RAG-based Q&A with the codebase.',
                'Week 7–8: Stripe, polish, and first 10 paying customers.',
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Simple, Transparent Pricing"
              title="Choose the plan that fits your team"
              description="Scales with you from startups to enterprises."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PRICING_TIERS.map((tier) => (
                <Card
                  key={tier.name}
                  highlighted={tier.highlighted}
                  className={`p-6 relative ${tier.highlighted ? 'border-green-500 shadow-xl' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-500 mb-2">{tier.name}</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${tier.price}
                    <span className="text-base font-normal text-gray-500">/mo</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 mb-6">{tier.description}</div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2.5 rounded-full text-center font-medium transition-all ${
                      tier.highlighted
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* MRR Growth Chart */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Financial Projection"
              title="Realistic MRR growth path"
              description="Based on lean customer acquisition and proven demand."
            />
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MRR_DATA}>
                    <defs>
                      <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#mrrGradient)"
                    />
                    <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                Projected MRR from $490 to $68,000 in 12 months
              </div>
            </div>
          </div>
        </section>

        {/* GTM Strategy */}
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Go-to-Market"
              title="How you get the first 50 customers"
              description="Targeted channels where engineering managers are already looking for solutions."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">YC Slack & Hacker News</h3>
                <p className="text-gray-600 text-sm">
                  YC companies are always hiring and onboarding. Post "Show HN" to reach
                  engineering managers directly.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                <p>LinkedIn</p>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">LinkedIn Cold Outreach</h3>
                <p className="text-gray-600 text-sm">
                  Target CTOs at 10–100 person companies that posted engineering jobs in the last
                  30 days. Pain is live.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Build in Public</h3>
                <p className="text-gray-600 text-sm">
                  Post your journey on Dev Twitter. "Day 14: generated a 30-page codebase guide in
                  4 minutes."
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to fix engineering onboarding?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join the waitlist and be among the first to transform how your team ramps up new
              developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your work email"
                className="px-6 py-3 rounded-full bg-white/10 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 sm:w-80"
              />
              <button className="bg-green-500 text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-colors">
                Request early access →
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-6">No spam. Unsubscribe anytime.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-gray-900">OnboardAI</span>
                </div>
                <p className="text-sm text-gray-500">
                  AI-powered codebase onboarding for modern engineering teams.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Demo</li>
                  <li>Changelog</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>About</li>
                  <li>Blog</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>Privacy</li>
                  <li>Terms</li>
                  <li>Security</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
              © 2025 OnboardAI. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}