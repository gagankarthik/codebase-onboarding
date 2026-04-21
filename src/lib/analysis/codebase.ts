import type {
  RepoSnapshot,
  CodebaseAnalysis,
  DirectoryNode,
  TechStackEntry,
  ComplexityMetrics,
} from "@/types"

const LANG_BY_EXT: Record<string, { name: string; category: TechStackEntry["category"] }> = {
  ts: { name: "TypeScript", category: "language" },
  tsx: { name: "TypeScript (React)", category: "language" },
  js: { name: "JavaScript", category: "language" },
  jsx: { name: "JavaScript (React)", category: "language" },
  py: { name: "Python", category: "language" },
  go: { name: "Go", category: "language" },
  rs: { name: "Rust", category: "language" },
  java: { name: "Java", category: "language" },
  rb: { name: "Ruby", category: "language" },
  cs: { name: "C#", category: "language" },
  cpp: { name: "C++", category: "language" },
  kt: { name: "Kotlin", category: "language" },
  swift: { name: "Swift", category: "language" },
  php: { name: "PHP", category: "language" },
  sql: { name: "SQL", category: "database" },
}

const FRAMEWORK_SIGNATURES: Array<{
  dep: string
  name: string
  version?: string
  category: TechStackEntry["category"]
}> = [
  { dep: "next", name: "Next.js", category: "framework" },
  { dep: "react", name: "React", category: "framework" },
  { dep: "vue", name: "Vue.js", category: "framework" },
  { dep: "@angular/core", name: "Angular", category: "framework" },
  { dep: "svelte", name: "Svelte", category: "framework" },
  { dep: "express", name: "Express", category: "framework" },
  { dep: "fastapi", name: "FastAPI", category: "framework" },
  { dep: "django", name: "Django", category: "framework" },
  { dep: "flask", name: "Flask", category: "framework" },
  { dep: "gin-gonic/gin", name: "Gin (Go)", category: "framework" },
  { dep: "tailwindcss", name: "Tailwind CSS", category: "tool" },
  { dep: "prisma", name: "Prisma", category: "database" },
  { dep: "drizzle-orm", name: "Drizzle ORM", category: "database" },
  { dep: "@aws-sdk", name: "AWS SDK", category: "cloud" },
  { dep: "openai", name: "OpenAI SDK", category: "tool" },
  { dep: "jest", name: "Jest", category: "testing" },
  { dep: "vitest", name: "Vitest", category: "testing" },
  { dep: "@playwright", name: "Playwright", category: "testing" },
  { dep: "cypress", name: "Cypress", category: "testing" },
  { dep: "stripe", name: "Stripe", category: "tool" },
  { dep: "redis", name: "Redis", category: "database" },
  { dep: "mongodb", name: "MongoDB", category: "database" },
  { dep: "sequelize", name: "Sequelize", category: "database" },
  { dep: "typeorm", name: "TypeORM", category: "database" },
  { dep: "graphql", name: "GraphQL", category: "tool" },
  { dep: "trpc", name: "tRPC", category: "framework" },
  { dep: "zustand", name: "Zustand", category: "tool" },
  { dep: "framer-motion", name: "Framer Motion", category: "tool" },
  { dep: "zod", name: "Zod", category: "tool" },
  { dep: "docker", name: "Docker", category: "cloud" },
]

function ext(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? ""
}

function dirname(path: string): string {
  const parts = path.split("/")
  return parts.length > 1 ? parts[0] : "."
}

function countLines(content: string): number {
  return content.split("\n").length
}

function isTestFile(path: string): boolean {
  return /\.(test|spec)\.|__tests__|\/test\/|\/tests\//.test(path)
}

function isConfigFile(path: string): boolean {
  return /\.(config|rc)\.|\.env|Makefile|Dockerfile|docker-compose/.test(path)
}

function detectEntryPoints(files: { path: string; content: string }[]): string[] {
  const candidates = [
    "index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js",
    "server.ts", "server.js", "src/index.ts", "src/main.ts",
  ]
  return files
    .filter((f) => candidates.some((c) => f.path === c || f.path.endsWith(`/${c}`)))
    .map((f) => f.path)
    .slice(0, 5)
}

function parseDependencies(files: { path: string; content: string }[]): Record<string, string> {
  const pkgFile = files.find((f) => f.path === "package.json")
  if (!pkgFile) return {}
  try {
    const pkg = JSON.parse(pkgFile.content) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  } catch {
    return {}
  }
}

export function analyzeCodebase(snapshot: RepoSnapshot): Omit<CodebaseAnalysis, "analysisId" | "repoId" | "analyzedAt"> {
  const { tree, files } = snapshot

  // ── Directory breakdown ────────────────────────────────────────────────────
  const dirMap: Record<string, { fileCount: number; totalLines: number }> = {}
  for (const path of tree) {
    const dir = dirname(path)
    if (!dirMap[dir]) dirMap[dir] = { fileCount: 0, totalLines: 0 }
    dirMap[dir].fileCount++
  }
  for (const file of files) {
    const dir = dirname(file.path)
    if (dirMap[dir]) dirMap[dir].totalLines += countLines(file.content)
  }
  const directoryTree: DirectoryNode[] = Object.entries(dirMap)
    .sort(([, a], [, b]) => b.fileCount - a.fileCount)
    .slice(0, 20)
    .map(([path, stats]) => ({ name: path.split("/").pop() ?? path, path, ...stats }))

  // ── Tech stack ─────────────────────────────────────────────────────────────
  const techStack: TechStackEntry[] = []
  const seenLangs = new Set<string>()

  for (const path of tree) {
    const e = ext(path)
    const lang = LANG_BY_EXT[e]
    if (lang && !seenLangs.has(lang.name)) {
      seenLangs.add(lang.name)
      techStack.push({ name: lang.name, category: lang.category, confidence: "detected" })
    }
  }

  const deps = parseDependencies(files)
  const seenFrameworks = new Set<string>()
  for (const sig of FRAMEWORK_SIGNATURES) {
    const matched = Object.keys(deps).find((d) => d === sig.dep || d.startsWith(sig.dep + "/") || d.startsWith(`@${sig.dep}`))
    if (matched && !seenFrameworks.has(sig.name)) {
      seenFrameworks.add(sig.name)
      techStack.push({
        name: sig.name,
        version: deps[matched]?.replace(/^[\^~]/, ""),
        category: sig.category,
        confidence: "detected",
      })
    }
  }

  // Dockerfile → Docker
  if (tree.some((p) => p === "Dockerfile" || p.endsWith("/Dockerfile"))) {
    techStack.push({ name: "Docker", category: "cloud", confidence: "detected" })
  }

  // ── Complexity ─────────────────────────────────────────────────────────────
  const fileLOC = files.map((f) => ({ path: f.path, lines: countLines(f.content) }))
  const totalLines = fileLOC.reduce((s, f) => s + f.lines, 0)
  const largestFiles = [...fileLOC].sort((a, b) => b.lines - a.lines).slice(0, 5)

  const complexity: ComplexityMetrics = {
    totalFiles: tree.length,
    totalLines,
    avgFileSizeLines: files.length > 0 ? Math.round(totalLines / files.length) : 0,
    largestFiles,
    dependencyCount: Object.keys(deps).length,
    testFileCount: tree.filter(isTestFile).length,
    configFileCount: tree.filter(isConfigFile).length,
  }

  return {
    directoryTree,
    techStack,
    complexity,
    entryPoints: detectEntryPoints(files),
  }
}
