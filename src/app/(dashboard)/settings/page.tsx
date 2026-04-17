"use client"

import { useState } from "react"
import { Copy, Check, GitBranch, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { generateId } from "@/lib/utils"
import type { Metadata } from "next"

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    features: ["1 repo", "5 seats", "On-demand guide refresh", "Email support"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$99",
    period: "/mo",
    features: [
      "3 repos",
      "20 seats",
      "Auto-refresh on push",
      "Slack notifications",
      "Priority support",
    ],
    highlight: true,
    badge: "Recommended",
  },
  {
    name: "Scale",
    price: "$249",
    period: "/mo",
    features: [
      "Unlimited repos & seats",
      "SSO / SAML",
      "Analytics dashboard",
      "Custom onboarding checklists",
      "Dedicated support",
    ],
    highlight: false,
  },
]

function AccountTab() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    toast.success("Profile updated successfully.")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Profile</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            U
          </div>
          <Button variant="outline" size="sm">
            Change avatar
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-destructive-subtle p-6">
        <h3 className="font-semibold text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Permanently delete your account and all associated data.
        </p>
        <div className="mt-4">
          <ConfirmDialog
            title="Delete account"
            description="This will permanently delete your account, all repos, onboardings, and guides. This action cannot be undone."
            confirmLabel="Delete my account"
            destructive
            onConfirm={() => { toast.error("Account deletion is not available in this demo.") }}
            trigger={
              <Button variant="destructive" size="sm">
                Delete account
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}

function BillingTab() {
  const currentPlan = "growth"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan
          return (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-5 ${
                plan.highlight
                  ? "border-primary bg-primary-subtle"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlight && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-foreground-muted">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => toast.info("Billing portal not available in demo.")}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      {[
        { name: "GitHub", icon: GitBranch, connected: true, description: "Sync repositories and receive push webhooks" },
        { name: "Slack", icon: null, connected: false, description: "Get notified when a new hire's guide is ready", comingSoon: true },
        { name: "GitLab", icon: null, connected: false, description: "Connect GitLab repositories", comingSoon: true },
      ].map((int) => (
        <div key={int.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-muted">
            {int.icon ? <int.icon className="h-5 w-5" /> : <span className="text-sm font-bold">{int.name[0]}</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{int.name}</span>
              {int.comingSoon && (
                <span className="rounded-full bg-background-muted px-2 py-0.5 text-xs text-foreground-muted">
                  Coming soon
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted">{int.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${int.connected ? "bg-success" : "bg-border"}`} />
            <span className="text-xs text-foreground-muted">{int.connected ? "Connected" : "Not connected"}</span>
          </div>
          {!int.comingSoon && (
            <Button variant="outline" size="sm" disabled={int.connected}>
              {int.connected ? "Disconnect" : "Connect"}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

function APITab() {
  const [apiKey] = useState(`coa_${generateId().replace(/-/g, "").slice(0, 32)}`)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(apiKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">API Key</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Use this key to authenticate requests to the Codebase Onboarding API.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Input
            type={revealed ? "text" : "password"}
            value={apiKey}
            readOnly
            className="font-mono text-xs"
          />
          <Button variant="outline" size="sm" onClick={() => setRevealed((v) => !v)}>
            {revealed ? "Hide" : "Reveal"}
          </Button>
          <Button variant="outline" size="icon-sm" onClick={handleCopy} aria-label="Copy API key">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Key regeneration not available in demo.")}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          Keep this key secret — treat it like a password.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Usage</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          {[
            { label: "API calls this month", value: "0" },
            { label: "Guides generated", value: "0" },
            { label: "Rate limit", value: "100 / min" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-background-muted p-3">
              <p className="text-xs text-foreground-muted">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Manage your account, billing, and integrations" />

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Plan & Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>
          <TabsContent value="api">
            <APITab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
