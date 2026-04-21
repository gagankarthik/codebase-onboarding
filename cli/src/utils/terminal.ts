import chalk from "chalk"
import ora, { Ora } from "ora"

export const log = {
  info: (msg: string) => console.log(chalk.blue("ℹ"), msg),
  success: (msg: string) => console.log(chalk.green("✓"), msg),
  warn: (msg: string) => console.log(chalk.yellow("⚠"), msg),
  error: (msg: string) => console.log(chalk.red("✗"), msg),
  step: (msg: string) => console.log(chalk.cyan("→"), msg),
  muted: (msg: string) => console.log(chalk.gray("  " + msg)),
  header: (msg: string) => {
    console.log()
    console.log(chalk.bold.white(msg))
    console.log(chalk.gray("─".repeat(Math.min(msg.length + 4, 60))))
  },
  blank: () => console.log(),
}

export function spinner(text: string): Ora {
  return ora({ text, color: "cyan", spinner: "dots" })
}

export function badge(
  text: string,
  type: "success" | "warn" | "error" | "info" | "neutral" = "info"
): string {
  const map = {
    success: chalk.bgGreen.black,
    warn: chalk.bgYellow.black,
    error: chalk.bgRed.white,
    info: chalk.bgBlue.white,
    neutral: chalk.bgGray.white,
  }
  return map[type](` ${text} `)
}

export function table(rows: [string, string][], indent = 2): void {
  const maxKeyLen = Math.max(...rows.map(([k]) => k.length))
  rows.forEach(([key, value]) => {
    const paddedKey = chalk.gray(key.padEnd(maxKeyLen))
    console.log(" ".repeat(indent) + paddedKey + "  " + value)
  })
}

export function section(title: string): void {
  console.log()
  console.log(chalk.bold.cyan("  " + title))
  console.log(chalk.gray("  " + "─".repeat(title.length + 2)))
}

export function progressBar(pct: number, width = 30): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  const bar = chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(empty))
  return `[${bar}] ${pct.toFixed(0)}%`
}

export function scoreColor(score: number): (text: string) => string {
  if (score >= 90) return (t) => chalk.green(t)
  if (score >= 70) return (t) => chalk.yellow(t)
  return (t) => chalk.red(t)
}
