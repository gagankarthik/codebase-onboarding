#!/usr/bin/env node
import { Command } from "commander"
import { initCommand } from "./commands/init"
import { securityCommand } from "./commands/security"
import { statusCommand } from "./commands/status"
import { fixCommand } from "./commands/fix"
import { reportCommand } from "./commands/report"
import { shareCommand } from "./commands/share"
import { syncCommand } from "./commands/sync"
import { monitorCommand } from "./commands/monitor"

const program = new Command()

program
  .name("onboardai")
  .description("OnboardAI CLI — accelerate developer onboarding")
  .version("1.0.0", "-v, --version", "Output the current version")

program
  .command("init")
  .description("Set up your development environment")
  .option("-i, --interactive", "Run the interactive setup wizard")
  .action(initCommand)

program
  .command("security")
  .description("Run a security audit on your codebase")
  .option("--scan", "Perform a full security scan")
  .option("--quiet", "Exit with error code if issues found (for CI/git hooks)")
  .option("--watch", "Watch files and re-scan automatically on change")
  .option("--output <format>", "Output format: json (for piping/integration)")
  .action(securityCommand)

program
  .command("status")
  .description("Show a complete environment health check")
  .action(statusCommand)

program
  .command("fix")
  .description("Auto-fix common environment issues")
  .option("--vulnerabilities", "Fix npm audit vulnerabilities")
  .option("--env", "Validate and fill in missing .env.local keys")
  .option("--ports", "Free blocked ports (3000, 5432)")
  .option("--all", "Run all available fixes")
  .action(fixCommand)

program
  .command("report")
  .description("Generate an onboarding progress report")
  .option("--send-to <email>", "Email the report to someone")
  .action(reportCommand)

program
  .command("share")
  .description("Share your onboarding context with the team")
  .option("--context", "Generate a shareable Markdown context summary")
  .action(shareCommand)

program
  .command("sync")
  .description("Sync local progress with the OnboardAI dashboard")
  .option("--api-key <key>", "Your OnboardAI API key")
  .action(syncCommand)

program
  .command("monitor")
  .description("Continuously monitor web events and auto-analyze errors with AI")
  .option("--repo <repoId>", "Repo ID to monitor (defaults to first connected repo)")
  .option("--interval <seconds>", "Polling interval in seconds (default: 10)", "10")
  .option("--ai", "Auto-analyze errors with AI as they arrive")
  .option("--api-key <key>", "Your OnboardAI API key")
  .action(monitorCommand)

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error("Unexpected error:", err instanceof Error ? err.message : err)
  process.exit(1)
})
