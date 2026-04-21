"use client"

import { useState, useEffect } from "react"
import { Copy, Check, GitBranch, RefreshCw, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"

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

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

function AccountTab() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState<string>("starter")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name ?? "")
          setEmail(data.user.email ?? "")
          setPlan(data.user.plan ?? "starter")
        }
      })
      .catch(() => toast.error("Failed to load account details."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Name cannot be empty.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error()
      toast.success("Profile updated successfully.")
    } catch {
      toast.error("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Profile</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {loading ? "…" : (initials(name) || "?")}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            {loading ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            {loading ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : (
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="cursor-not-allowed opacity-60"
              />
            )}
            <p className="text-xs text-foreground-muted">Email is managed by your auth provider.</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Plan:</span>
          <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium capitalize text-primary">
            {plan}
          </span>
        </div>
        <div className="mt-4">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save changes"}
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
            onConfirm={() => {
              toast.error("Account deletion is not available in this environment.")
            }}
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
  const [currentPlan, setCurrentPlan] = useState<string>("growth")

  useEffect(() => {
    fetch("/api/settings/account")
      .then((r) => r.json())
      .then((data) => { if (data.user?.plan) setCurrentPlan(data.user.plan) })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan
          return (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-5 ${
                plan.highlight ? "border-primary bg-primary-subtle" : "border-border bg-card"
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
        {
          name: "GitHub",
          icon: GitBranch,
          connected: true,
          description: "Sync repositories and receive push webhooks",
        },
        {
          name: "Slack",
          icon: null,
          connected: false,
          description: "Get notified when a new hire's guide is ready",
          comingSoon: true,
        },
        {
          name: "GitLab",
          icon: null,
          connected: false,
          description: "Connect GitLab repositories",
          comingSoon: true,
        },
      ].map((int) => (
        <div
          key={int.name}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-muted">
            {int.icon ? (
              <int.icon className="h-5 w-5" />
            ) : (
              <span className="text-sm font-bold">{int.name[0]}</span>
            )}
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
            <span
              className={`h-2 w-2 rounded-full ${int.connected ? "bg-success" : "bg-border"}`}
            />
            <span className="text-xs text-foreground-muted">
              {int.connected ? "Connected" : "Not connected"}
            </span>
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
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetch("/api/settings/api-key")
      .then((r) => r.json())
      .then((data) => { if (data.apiKey) setApiKey(data.apiKey) })
      .catch(() => toast.error("Failed to load API key."))
      .finally(() => setLoading(false))
  }, [])

  function handleCopy() {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const res = await fetch("/api/settings/api-key/regenerate", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setApiKey(data.apiKey)
      setRevealed(true)
      toast.success("API key regenerated. Update your CLI config.")
    } catch {
      toast.error("Failed to regenerate API key.")
    } finally {
      setRegenerating(false)
    }
  }

  const displayValue = loading ? "" : (apiKey ?? "")
  const maskedValue = displayValue.slice(0, 7) + "•".repeat(Math.max(0, displayValue.length - 7))

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">API Key</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Use this key with the{" "}
          <code className="rounded bg-background-muted px-1 font-mono text-xs">onboardai</code>{" "}
          CLI and REST API. Keep it secret — treat it like a password.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {loading ? (
            <Skeleton className="h-9 flex-1 rounded-md" />
          ) : (
            <Input
              type="text"
              value={revealed ? displayValue : maskedValue}
              readOnly
              className="flex-1 font-mono text-xs"
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealed((v) => !v)}
            disabled={loading}
          >
            {revealed ? (
              <><EyeOff className="mr-1.5 h-3.5 w-3.5" />Hide</>
            ) : (
              <><Eye className="mr-1.5 h-3.5 w-3.5" />Reveal</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={loading || !apiKey}
            aria-label="Copy API key"
          >
            {copied ? (
              <><Check className="mr-1.5 h-3.5 w-3.5 text-success" />Copied</>
            ) : (
              <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>
            )}
          </Button>
          <ConfirmDialog
            title="Regenerate API key"
            description="Your current key will stop working immediately. Any CLI config or scripts using it will need to be updated."
            confirmLabel="Regenerate key"
            destructive
            onConfirm={handleRegenerate}
            trigger={
              <Button variant="outline" size="sm" disabled={regenerating || loading}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            }
          />
        </div>
        <div className="mt-4 rounded-lg bg-background-muted p-3 font-mono text-xs text-foreground-muted">
          <span className="text-foreground-subtle"># CLI quick start</span>
          <br />
          onboardai sync --api-key {loading ? "<your-key>" : (apiKey ?? "<your-key>")}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Usage</h3>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
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
        <TabsList className="grid w-full grid-cols-4 lg:flex lg:w-auto lg:grid-cols-none">
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
