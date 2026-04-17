import type { RepoSnapshot, RepoMetadata } from "@/types"
import { getGitHubClient } from "./client"

const EXCLUDED_PATTERNS = [
  "node_modules",
  "dist",
  "build",
  ".next",
  ".lock",
  ".min.js",
  ".min.css",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".git/",
  "coverage",
  ".nyc_output",
  "__pycache__",
  ".DS_Store",
]

const PRIORITY_PATTERNS = [
  /^README/i,
  /^index\./,
  /^main\./,
  /^app\./,
  /^server\./,
  /\.config\./,
  /\.env\.example$/,
  /^package\.json$/,
  /^tsconfig\.json$/,
  /^pyproject\.toml$/,
  /^Makefile$/,
  /^Dockerfile$/,
]

function isExcluded(path: string): boolean {
  return EXCLUDED_PATTERNS.some((pattern) => path.includes(pattern))
}

function isPriority(path: string): boolean {
  const filename = path.split("/").pop() ?? path
  return PRIORITY_PATTERNS.some((p) => p.test(filename))
}

export async function ingestRepo(
  accessToken: string,
  fullName: string
): Promise<RepoSnapshot> {
  const octokit = getGitHubClient(accessToken)
  const [owner, repo] = fullName.split("/")

  const { data: repoData } = await octokit.repos.get({ owner, repo })
  const metadata: RepoMetadata = {
    description: repoData.description ?? "",
    language: repoData.language ?? "",
    stars: repoData.stargazers_count,
    defaultBranch: repoData.default_branch,
    fullName: repoData.full_name,
  }

  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: repoData.default_branch,
    recursive: "1",
  })

  const allFiles = (treeData.tree ?? [])
    .filter((item) => item.type === "blob" && item.path)
    .map((item) => item.path as string)
    .filter((path) => !isExcluded(path))

  const priorityFiles = allFiles.filter(isPriority)
  const otherFiles = allFiles.filter((p) => !isPriority(p))
  const selectedFiles = [...priorityFiles, ...otherFiles].slice(0, 60)

  const fileContents = await Promise.allSettled(
    selectedFiles.map(async (path) => {
      const { data } = await octokit.repos.getContent({ owner, repo, path })
      if (Array.isArray(data) || data.type !== "file") return null
      const content = Buffer.from(data.content, "base64").toString("utf-8")
      return { path, content: content.slice(0, 8000) }
    })
  )

  const files = fileContents
    .filter(
      (r): r is PromiseFulfilledResult<{ path: string; content: string }> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value)

  return { tree: allFiles, files, metadata }
}
