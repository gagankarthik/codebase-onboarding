import chalk from "chalk"
import { log, spinner, badge, section } from "../utils/terminal"
import { readConfig, createApiClient } from "../utils/api"

interface MonitorOptions {
  repo?: string
  interval?: string
  ai?: boolean
  apiKey?: string
}

interface EventAnalysis {
  explanation: string
  rootCause: string
  affectedFile?: string
  affectedLine?: number
  suggestedFix: string
  confidence: "high" | "medium" | "low"
}

interface WebEvent {
  eventId: string
  repoId: string
  type: string
  message: string
  stack?: string
  url?: string
  filename?: string
  lineno?: number
  analysis?: EventAnalysis
  analyzedAt?: string
  createdAt: string
}

const TYPE_COLORS: Record<string, (s: string) => string> = {
  error:       (s) => chalk.red(s),
  api_error:   (s) => chalk.red(s),
  warning:     (s) => chalk.yellow(s),
  page_view:   (s) => chalk.blue(s),
  performance: (s) => chalk.magenta(s),
  info:        (s) => chalk.gray(s),
}

const TYPE_ICON: Record<string, string> = {
  error:       "✗",
  api_error:   "✗",
  warning:     "⚠",
  page_view:   "→",
  performance: "⚡",
  info:        "ℹ",
}

function colorType(type: string, text: string): string {
  return (TYPE_COLORS[type] ?? chalk.white)(text)
}

function printEvent(event: WebEvent): void {
  const icon = TYPE_ICON[event.type] ?? "·"
  const time = new Date(event.createdAt).toLocaleTimeString()
  const typeLabel = colorType(event.type, `[${event.type.toUpperCase().replace("_", " ")}]`)
  const loc = event.filename ? chalk.gray(` ${event.filename}${event.lineno ? `:${event.lineno}` : ""}`) : ""
  const url = event.url ? chalk.gray(` · ${event.url}`) : ""

  console.log(`  ${colorType(event.type, icon)} ${typeLabel} ${chalk.white(event.message)}${loc}${url}  ${chalk.gray(time)}`)
}

function printAnalysis(analysis: EventAnalysis): void {
  console.log()
  console.log(chalk.bold.cyan("  ✦ AI Analysis"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))

  const confColor =
    analysis.confidence === "high" ? chalk.green : analysis.confidence === "medium" ? chalk.yellow : chalk.gray
  console.log(`  ${chalk.gray("Confidence:")} ${confColor(analysis.confidence)}`)
  console.log()
  console.log(`  ${chalk.bold("What happened:")}`)
  console.log(`  ${chalk.white(analysis.explanation)}`)
  console.log()
  console.log(`  ${chalk.bold("Root cause:")}`)
  console.log(`  ${chalk.white(analysis.rootCause)}`)

  if (analysis.affectedFile) {
    console.log()
    console.log(`  ${chalk.bold("Where to fix:")}`)
    console.log(`  ${chalk.cyan(analysis.affectedFile)}${analysis.affectedLine ? chalk.gray(`:${analysis.affectedLine}`) : ""}`)
  }

  console.log()
  console.log(`  ${chalk.bold("How to fix:")}`)
  const fixLines = analysis.suggestedFix.split(". ").filter(Boolean)
  fixLines.forEach((line) => console.log(`  ${chalk.white("→")} ${chalk.white(line.trim())}${line.endsWith(".") ? "" : "."}`))
  console.log()
}

async function triggerAnalysis(client: ReturnType<typeof createApiClient>, eventId: string): Promise<EventAnalysis | null> {
  try {
    const res = await client.post<{ analysis: EventAnalysis }>("/api/events/analyze", { eventId })
    return res.data.analysis
  } catch {
    return null
  }
}

export async function monitorCommand(options: MonitorOptions): Promise<void> {
  const cfg = await readConfig()
  const apiKey = options.apiKey ?? cfg.apiKey

  if (!apiKey) {
    log.error("No API key found. Run: onboardai sync --api-key YOUR_KEY")
    process.exit(1)
  }

  const client = createApiClient(apiKey)
  const intervalMs = Math.max(5, parseInt(options.interval ?? "10", 10)) * 1000

  // Resolve repo
  let repoId = options.repo
  if (!repoId) {
    const s = spinner("Fetching your repos…").start()
    try {
      const res = await client.get<{ repos?: { repoId: string; fullName: string }[] }>("/api/repos")
      s.stop()
      const repos = res.data.repos ?? []
      if (repos.length === 0) {
        log.error("No repos connected. Connect one from the dashboard first.")
        process.exit(1)
      }
      repoId = repos[0].repoId
      log.info(`Monitoring: ${chalk.cyan(repos[0].fullName)}`)
    } catch {
      s.stop()
      log.error("Failed to fetch repos. Check your API key and network connection.")
      process.exit(1)
    }
  }

  console.log()
  console.log(chalk.bold("  ◉ OnboardAI Monitor"))
  console.log(chalk.gray("  ─────────────────────────────────────────"))
  console.log(chalk.gray(`  Polling every ${intervalMs / 1000}s${options.ai ? "  ·  AI analysis: ON" : ""}  ·  Ctrl+C to stop`))
  console.log()

  let since: string | undefined
  const seen = new Set<string>()

  async function poll(): Promise<void> {
    try {
      const url = `/api/events?repoId=${repoId}&limit=50${since ? `&since=${since}` : ""}`
      const res = await client.get<{ events?: WebEvent[] }>(url)
      const events: WebEvent[] = (res.data.events ?? []).filter((e) => !seen.has(e.eventId))

      if (events.length === 0) return

      // Print new events oldest-first
      const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      sorted.forEach((e) => {
        seen.add(e.eventId)
        printEvent(e)
      })

      // Update since cursor
      since = sorted[sorted.length - 1].createdAt

      // Auto-analyze errors with AI
      if (options.ai) {
        const errors = sorted.filter(
          (e) => (e.type === "error" || e.type === "api_error") && !e.analysis
        )
        for (const error of errors) {
          const s2 = spinner(`Analyzing: ${error.message.slice(0, 60)}…`).start()
          const analysis = await triggerAnalysis(client, error.eventId)
          s2.stop()
          if (analysis) printAnalysis(analysis)
        }
      }
    } catch {
      // Silent — don't spam errors on transient network issues
    }
  }

  // Initial fetch then poll
  await poll()

  const interval = setInterval(poll, intervalMs)

  // Print stats every 60 seconds
  const statsInterval = setInterval(async () => {
    try {
      const res = await client.get<{ stats?: Record<string, number> }>(`/api/events?repoId=${repoId}&stats=1`)
      const stats = res.data.stats ?? {}
      const total = Object.values(stats).reduce((a, b) => a + b, 0)
      if (total === 0) return

      section("24h stats")
      if ((stats.error ?? 0) + (stats.api_error ?? 0) > 0)
        console.log(`  ${chalk.red("Errors")}       ${stats.error ?? 0} JS · ${stats.api_error ?? 0} API`)
      if ((stats.warning ?? 0) > 0)
        console.log(`  ${chalk.yellow("Warnings")}     ${stats.warning ?? 0}`)
      if ((stats.page_view ?? 0) > 0)
        console.log(`  ${chalk.blue("Page views")}   ${stats.page_view ?? 0}`)
      if ((stats.performance ?? 0) > 0)
        console.log(`  ${chalk.magenta("Performance")}  ${stats.performance ?? 0}`)
      console.log()
    } catch { /* ignore */ }
  }, 60_000)

  process.on("SIGINT", () => {
    clearInterval(interval)
    clearInterval(statsInterval)
    console.log()
    log.info("Monitor stopped.")
    process.exit(0)
  })

  // Keep alive
  await new Promise<void>(() => {})
}
