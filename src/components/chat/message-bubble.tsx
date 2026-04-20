"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, FileCode2 } from "lucide-react"
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
    <div className="group relative my-2 rounded-lg bg-code-bg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
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

// Strip the Sources section from content for clean rendering
function stripSources(content: string): string {
  const idx = content.indexOf("\n---\n📎 Sources:")
  return idx >= 0 ? content.slice(0, idx).trim() : content.trim()
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
              <code
                key={j}
                className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-code-foreground"
              >
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
  repoFullName?: string
  repoBranch?: string
}

export function MessageBubble({ message, repoFullName, repoBranch = "main" }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const cleanContent = isUser ? message.content : stripSources(message.content)
  const citations = message.citations ?? []

  function githubUrl(path: string): string {
    if (!repoFullName) return "#"
    return `https://github.com/${repoFullName}/blob/${repoBranch}/${path}`
  }

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "max-w-[80%] space-y-2",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border bg-card text-foreground"
          )}
        >
          <div className="leading-relaxed">{renderContent(cleanContent)}</div>
          <p className={cn("mt-1.5 text-right text-xs opacity-60")}>
            {formatRelativeTime(message.createdAt)}
          </p>
        </div>

        {/* Provenance citations */}
        {!isUser && citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {citations.map((path) => (
              <a
                key={path}
                href={githubUrl(path)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary"
                title={`View ${path} on GitHub`}
              >
                <FileCode2 className="h-3 w-3 shrink-0" />
                <span className="font-mono truncate max-w-[180px]">{path.split("/").slice(-2).join("/")}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
