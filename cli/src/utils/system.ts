import { execa } from "execa"
import semver from "semver"
import * as fs from "fs-extra"
import * as path from "path"
import * as net from "net"

export interface SystemInfo {
  nodeVersion: string
  npmVersion: string
  nodeOk: boolean
  npmOk: boolean
  gitAvailable: boolean
  isGitRepo: boolean
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const [nodeVersion, npmVersion, gitAvailable, isGitRepo] = await Promise.all([
    getVersion("node", "--version"),
    getVersion("npm", "--version"),
    checkCommandExists("git"),
    checkIsGitRepo(process.cwd()),
  ])

  return {
    nodeVersion,
    npmVersion,
    nodeOk: !!nodeVersion && semver.gte(nodeVersion.replace("v", ""), "18.0.0"),
    npmOk: !!npmVersion && semver.gte(npmVersion, "8.0.0"),
    gitAvailable,
    isGitRepo,
  }
}

async function getVersion(cmd: string, flag: string): Promise<string> {
  try {
    const { stdout } = await execa(cmd, [flag])
    return stdout.trim().replace(/^v/, "")
  } catch {
    return ""
  }
}

async function checkCommandExists(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ["--version"])
    return true
  } catch {
    return false
  }
}

async function checkIsGitRepo(cwd: string): Promise<boolean> {
  try {
    await execa("git", ["rev-parse", "--git-dir"], { cwd })
    return true
  } catch {
    return false
  }
}

export async function getDependencyStatus(cwd: string): Promise<{
  installed: boolean
  packageJsonExists: boolean
  nodeModulesExists: boolean
}> {
  const packageJsonExists = await fs.pathExists(path.join(cwd, "package.json"))
  const nodeModulesExists = await fs.pathExists(path.join(cwd, "node_modules"))
  return {
    installed: packageJsonExists && nodeModulesExists,
    packageJsonExists,
    nodeModulesExists,
  }
}

export async function runNpmAudit(cwd: string): Promise<{
  vulnerabilities: number
  critical: number
  high: number
  moderate: number
  low: number
}> {
  try {
    const { stdout } = await execa("npm", ["audit", "--json"], {
      cwd,
      reject: false,
    })
    const data = JSON.parse(stdout) as {
      metadata?: {
        vulnerabilities?: {
          total?: number
          critical?: number
          high?: number
          moderate?: number
          low?: number
        }
      }
    }
    const v = data?.metadata?.vulnerabilities ?? {}
    return {
      vulnerabilities: v.total ?? 0,
      critical: v.critical ?? 0,
      high: v.high ?? 0,
      moderate: v.moderate ?? 0,
      low: v.low ?? 0,
    }
  } catch {
    return { vulnerabilities: 0, critical: 0, high: 0, moderate: 0, low: 0 }
  }
}

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.close(() => resolve(false))
    })
    server.on("error", () => resolve(true))
  })
}

export async function killPort(port: number): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execa("netstat", ["-ano"])
      const lines = stdout.split("\n").filter((l) => l.includes(`:${port} `))
      for (const line of lines) {
        const pid = line.trim().split(/\s+/).pop()
        if (pid && /^\d+$/.test(pid)) {
          await execa("taskkill", ["/PID", pid, "/F"])
        }
      }
    } else {
      await execa("lsof", ["-ti", `:${port}`]).then(({ stdout }) => {
        const pids = stdout.trim().split("\n").filter(Boolean)
        return Promise.all(pids.map((pid) => execa("kill", ["-9", pid])))
      })
    }
    return true
  } catch {
    return false
  }
}

export async function getGitCommitCount(cwd: string): Promise<number> {
  try {
    const { stdout } = await execa("git", ["rev-list", "--count", "HEAD"], { cwd })
    return parseInt(stdout.trim(), 10) || 0
  } catch {
    return 0
  }
}

export async function getGitUserEmail(cwd: string): Promise<string> {
  try {
    const { stdout } = await execa("git", ["config", "user.email"], { cwd })
    return stdout.trim()
  } catch {
    return ""
  }
}

export async function getProjectName(cwd: string): Promise<string> {
  try {
    const pkg = await fs.readJson(path.join(cwd, "package.json"))
    return (pkg.name as string) || path.basename(cwd)
  } catch {
    return path.basename(cwd)
  }
}
