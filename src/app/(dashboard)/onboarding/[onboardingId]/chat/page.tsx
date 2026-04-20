"use client"

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, FileCode2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MessageBubble } from "@/components/chat/message-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { slideInRight } from "@/lib/animations"
import { generateId } from "@/lib/utils"
import type { Onboarding, ChatMessage, Repo } from "@/types"

function getRolePrompts(role: string, repoName: string): string[] {
  const r = role.toLowerCase()
  if (r.includes("backend") || r.includes("api")) {
    return [
      `How do I run the test suite for the API services in ${repoName}?`,
      `Show me a similar PR to what I'm working on — an API endpoint change`,
      `Who owns the core service modules and who should I ask about them?`,
      `What's the error handling pattern used across all API routes?`,
    ]
  }
  if (r.includes("frontend") || r.includes("ui")) {
    return [
      `How is state management handled in the frontend of ${repoName}?`,
      `Show me a similar PR to what I'm working on — a UI component change`,
      `What's the component library and design system used here?`,
      `How do I run the frontend dev server locally?`,
    ]
  }
  if (r.includes("devops") || r.includes("platform") || r.includes("infra")) {
    return [
      `Walk me through the CI/CD pipeline configuration in ${repoName}`,
      `What infrastructure-as-code tools are used here?`,
      `How are environment variables and secrets managed?`,
      `What's the deployment process for a typical code change?`,
    ]
  }
  if (r.includes("data") || r.includes("ml") || r.includes("ai")) {
    return [
      `What data pipelines or ETL jobs exist in ${repoName}?`,
      `How is data validation handled across the codebase?`,
      `Where are database migrations stored and how do I run them?`,
      `How are models or ML components structured?`,
    ]
  }
  if (r.includes("mobile") || r.includes("ios") || r.includes("android")) {
    return [
      `How do I set up the mobile development environment for ${repoName}?`,
      `What's the navigation architecture in the mobile app?`,
      `How is API communication handled from the mobile layer?`,
      `Show me a recent PR for a mobile feature implementation`,
    ]
  }
  return [
    `How do I run the full project locally in ${repoName}?`,
    `What are the most important files I should read first?`,
    `Show me a similar PR to what I'm working on`,
    `What are the main API endpoints?`,
  ]
}

export default function ChatPage() {
  const { onboardingId } = useParams<{ onboardingId: string }>()
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null)
  const [repo, setRepo] = useState<Repo | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const [ob, hist, repos] = await Promise.all([
          fetch(`/api/onboarding/${onboardingId}`).then((r) => r.json()) as Promise<{ onboarding: Onboarding }>,
          fetch(`/api/chat/history?onboardingId=${onboardingId}`).then((r) => r.json()) as Promise<{ messages: ChatMessage[] }>,
          fetch(`/api/repos`).then((r) => r.json()) as Promise<{ repos: Repo[] }>,
        ])
        setOnboarding(ob.onboarding)
        setMessages(hist.messages ?? [])
        if (ob.onboarding) {
          const found = (repos.repos ?? []).find((r) => r.repoId === ob.onboarding.repoId)
          setRepo(found ?? null)
        }
      } catch {
        toast.error("Failed to load chat context — please refresh.")
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [onboardingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: ChatMessage = {
      messageId: generateId(),
      onboardingId,
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setStreaming(true)

    const assistantMsgId = generateId()
    let assistantContent = ""

    setMessages((prev) => [
      ...prev,
      { messageId: assistantMsgId, onboardingId, role: "assistant", content: "", citations: [], createdAt: new Date().toISOString() },
    ])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingId, message: text.trim() }),
      })
      if (!res.ok) throw new Error("Chat request failed")
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split("\n")
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") break
          try {
            const parsed = JSON.parse(data) as { text?: string; citations?: string[] }
            if (parsed.text) {
              assistantContent += parsed.text
              setMessages((prev) =>
                prev.map((m) => m.messageId === assistantMsgId ? { ...m, content: assistantContent } : m)
              )
            }
            if (parsed.citations) {
              setMessages((prev) =>
                prev.map((m) => m.messageId === assistantMsgId ? { ...m, citations: parsed.citations } : m)
              )
            }
          } catch {}
        }
      }
    } catch {
      toast.error("Message failed to send — please try again.")
      setMessages((prev) => prev.filter((m) => m.messageId !== assistantMsgId))
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    )
  }

  const repoName = repo?.fullName.split("/")[1] ?? "this repo"
  const rolePrompts = onboarding ? getRolePrompts(onboarding.role, repoName) : []
  const showSuggestions = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/onboarding/${onboardingId}`)}
          aria-label="Back to guide"
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            Ask about{" "}
            <span className="font-mono text-primary">{repo?.fullName ?? "this codebase"}</span>
          </p>
          <p className="text-xs text-foreground-muted flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            GPT-4o mini · Codebase context loaded
            {onboarding && <span className="ml-1">· For {onboarding.role}</span>}
          </p>
        </div>
        {repo && (
          <a
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground-muted hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            View repo
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Ask your codebase anything</p>
              <p className="text-xs text-foreground-muted">
                Questions tailored for{" "}
                <span className="font-medium text-foreground">{onboarding?.role ?? "your role"}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rolePrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground-muted hover:border-primary/30 hover:bg-primary-subtle hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.messageId} variants={slideInRight} initial="initial" animate="animate">
              {msg.content === "" && msg.role === "assistant" ? (
                <TypingIndicator />
              ) : (
                <MessageBubble
                  message={msg}
                  repoFullName={repo?.fullName}
                  repoBranch={repo?.branch ?? "main"}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this codebase..."
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[40px] max-h-[120px]"
            rows={1}
            aria-label="Chat message"
          />
          <Button size="icon" onClick={() => void sendMessage(input)} disabled={!input.trim() || streaming} aria-label="Send message">
            {streaming ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-xs text-foreground-muted">Enter to send · Shift+Enter for new line</p>
          {input.length > 200 && <p className="text-xs text-foreground-muted">{input.length} / 2000</p>}
        </div>
      </div>
    </div>
  )
}
