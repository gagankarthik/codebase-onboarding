"use client"

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, Dot } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MessageBubble } from "@/components/chat/message-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { slideInRight } from "@/lib/animations"
import { generateId } from "@/lib/utils"
import type { Onboarding, ChatMessage } from "@/types"

const SUGGESTED_QUESTIONS = [
  "How does authentication work in this codebase?",
  "What's the database schema?",
  "How do I run the tests locally?",
  "What are the main API endpoints?",
  "How is the project structured?",
  "What coding conventions does the team use?",
]

export default function ChatPage() {
  const { onboardingId } = useParams<{ onboardingId: string }>()
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null)
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
    fetch(`/api/onboarding/${onboardingId}`)
      .then((r) => r.json())
      .then((d: { onboarding: Onboarding }) => setOnboarding(d.onboarding))
      .catch(() => toast.error("Failed to load chat context — please refresh."))

    fetch(`/api/chat/history?onboardingId=${onboardingId}`)
      .then((r) => r.json())
      .then((d: { messages: ChatMessage[] }) => setMessages(d.messages ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
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
      {
        messageId: assistantMsgId,
        onboardingId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      },
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
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data) as { text?: string }
              if (parsed.text) {
                assistantContent += parsed.text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.messageId === assistantMsgId ? { ...m, content: assistantContent } : m
                  )
                )
              }
            } catch {}
          }
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
      sendMessage(input)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    )
  }

  const showSuggestions = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/onboarding/${onboardingId}`)}
          aria-label="Back to guide"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">
            Chatting about {onboarding?.newHireName ?? "this onboarding"}
          </p>
          <p className="text-xs text-foreground-muted flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Powered by GPT-4o mini · Codebase context loaded
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-center text-sm text-foreground-muted">
              Ask anything about the codebase
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
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
            <motion.div
              key={msg.messageId}
              variants={slideInRight}
              initial="initial"
              animate="animate"
            >
              {msg.content === "" && msg.role === "assistant" ? (
                <TypingIndicator />
              ) : (
                <MessageBubble message={msg} />
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
            onChange={(e) => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this codebase..."
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[40px] max-h-[120px]"
            rows={1}
            aria-label="Chat message"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            aria-label="Send message"
          >
            {streaming ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-xs text-foreground-muted">Enter to send · Shift+Enter for new line</p>
          {input.length > 200 && (
            <p className="text-xs text-foreground-muted">{input.length} / 2000</p>
          )}
        </div>
      </div>
    </div>
  )
}
