"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { ChatMessage } from "@/types"

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-2 rounded-lg bg-code-bg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-foreground-muted font-mono">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-xs text-code-foreground">{code}</code>
      </pre>
    </div>
  )
}

function renderContent(content: string) {
  const parts = content.split(/(```[\w]*\n[\s\S]*?```)/g)
  return parts.map((part, i) => {
    const codeMatch = part.match(/```([\w]*)\n([\s\S]*?)```/)
    if (codeMatch) {
      return <CodeBlock key={i} language={codeMatch[1]} code={codeMatch[2]} />
    }
    return (
      <p key={i} className="whitespace-pre-wrap">
        {part.split(/(`[^`]+`)/g).map((segment, j) => {
          if (segment.startsWith("`") && segment.endsWith("`")) {
            return (
              <code key={j} className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-code-foreground">
                {segment.slice(1, -1)}
              </code>
            )
          }
          return segment
        })}
      </p>
    )
  })
}

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground"
        )}
      >
        <div className="leading-relaxed">{renderContent(message.content)}</div>
        <p className={cn("mt-1.5 text-right text-xs opacity-60")}>
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
