import { Octokit } from "@octokit/rest"

export function getGitHubClient(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken })
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  })

  const data = (await response.json()) as { access_token?: string; error?: string }
  if (data.error || !data.access_token) {
    throw new Error(data.error ?? "Failed to exchange GitHub code for token")
  }
  return data.access_token
}
