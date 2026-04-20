"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitPullRequest, Copy, Check, Loader2, ChevronDown, ChevronUp, User, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { scaleIn } from "@/lib/animations"

interface PrPreviewData {
  title: string
  body: string
  reviewers: string[]
  labels: string[]
}

interface PrPreviewPanelProps {
  onboardingId: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export function PrPreviewPanel({ onboardingId }: PrPreviewPanelProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PrPreviewData | null>(null)

  async function generatePreview() {
    if (!description.trim()) {
      toast.error("Describe what you're working on first.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/onboarding/${onboardingId}/pr-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })
      const data = await res.json() as { preview?: PrPreviewData; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to generate PR preview")
      setPreview(data.preview!)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate PR draft")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 hover:bg-background-subtle transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-subtle">
            <GitPullRequest className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">PR Preview Panel</h3>
            <p className="text-xs text-foreground-muted">Generate a draft PR description for your first contribution</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-5 space-y-5">
              {/* Input */}
              <div className="space-y-1.5">
                <Label htmlFor="pr-desc">What are you working on?</Label>
                <Textarea
                  id="pr-desc"
                  placeholder="e.g. Added rate limiting to the /api/users endpoint using a Redis-based sliding window algorithm"
                  className="min-h-20 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={generatePreview}
                disabled={loading || !description.trim()}
                className="gap-2"
                size="sm"
              >
                {loading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating draft...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Generate PR draft</>
                )}
              </Button>

              {/* Preview */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                  >
                    {/* Title */}
                    <div className="rounded-lg border border-border bg-background-subtle">
                      <div className="flex items-center justify-between border-b border-border px-4 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">PR Title</span>
                        <CopyButton text={preview.title} />
                      </div>
                      <p className="px-4 py-3 text-sm font-medium text-foreground">{preview.title}</p>
                    </div>

                    {/* Body */}
                    <div className="rounded-lg border border-border bg-background-subtle">
                      <div className="flex items-center justify-between border-b border-border px-4 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Description</span>
                        <CopyButton text={preview.body} />
                      </div>
                      <pre className="whitespace-pre-wrap px-4 py-3 text-xs text-foreground leading-relaxed font-sans">
                        {preview.body}
                      </pre>
                    </div>

                    {/* Reviewers */}
                    {preview.reviewers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Suggested reviewers</p>
                        <div className="flex flex-wrap gap-2">
                          {preview.reviewers.map((r) => (
                            <div
                              key={r}
                              className="flex items-center gap-1.5 rounded-full border border-border bg-background-muted px-3 py-1 text-xs text-foreground"
                            >
                              <User className="h-3 w-3 text-foreground-muted" />
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Labels */}
                    {preview.labels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {preview.labels.map((l) => (
                          <span
                            key={l}
                            className="rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        const full = `# ${preview.title}\n\n${preview.body}`
                        navigator.clipboard.writeText(full).catch(() => {})
                        toast.success("Full PR template copied to clipboard.")
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy full PR template
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
